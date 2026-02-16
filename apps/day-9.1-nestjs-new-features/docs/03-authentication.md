# 3. Authentication & Authorization

NestJS provides robust authentication integration through Passport.js and custom guards.

---

## Libraries Commonly Used

| Library | Purpose | Package |
|---------|---------|---------|
| **Passport.js** | Auth strategies | `@nestjs/passport` |
| **JWT** | Token-based auth | `@nestjs/jwt` |
| **bcrypt/argon2** | Password hashing | `bcrypt`, `argon2` |
| **OAuth2** | Social login | `passport-google-oauth20`, etc. |
| **SAML** | Enterprise SSO | `passport-saml` |

---

## Nest Integration

```
┌─────────────────────────────────────────┐
│              Guards Layer               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │JwtGuard │  │RolesGuard│ │ApiGuard │ │
│  └─────────┘  └─────────┘  └─────────┘ │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           Passport Strategies           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │  Local  │  │   JWT   │  │ Google  │ │
│  └─────────┘  └─────────┘  └─────────┘ │
└─────────────────────────────────────────┘
```

---

## JWT Authentication

### Installation
```bash
npm install @nestjs/passport @nestjs/jwt passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

### Auth Module
```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### Auth Service
```ts
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

### Local Strategy
```ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

### JWT Strategy
```ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

---

## Guards

### JWT Auth Guard
```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### Local Auth Guard
```ts
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
```

### Usage
```ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
```

---

## Role-Based Authorization

### Roles Decorator
```ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### Roles Guard
```ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### Usage
```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('admin')
getAdminData() {
  return 'Admin only data';
}
```

---

## OAuth2 / Google Login

### Installation
```bash
npm install passport-google-oauth20
npm install -D @types/passport-google-oauth20
```

### Google Strategy
```ts
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { emails, displayName } = profile;
    return {
      email: emails[0].value,
      name: displayName,
      accessToken,
    };
  }
}
```

---

## Refresh Tokens

```ts
@Injectable()
export class AuthService {
  async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: process.env.JWT_SECRET, expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    // Validate refresh token and issue new tokens
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }
    
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }
}
```

---

## Best Practices

1. **Never store plain passwords** - Use bcrypt or argon2
2. **Use short-lived access tokens** with refresh tokens
3. **Store refresh tokens securely** (HttpOnly cookies or hashed in DB)
4. **Implement token revocation** for logout
5. **Use HTTPS** in production
6. **Rate limit auth endpoints** to prevent brute force
7. **Validate JWT secret** length (min 256 bits)
