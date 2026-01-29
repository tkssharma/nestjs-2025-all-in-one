# 📹 Video 7: Angular-Inspired Design in NestJS

> How NestJS borrows patterns from Angular

---

## 🎯 What You'll Learn

- Shared concepts between Angular and NestJS
- Why NestJS chose Angular patterns
- Benefits of this design approach

---

## Topic 7.1: Shared Concepts Comparison

| Concept | Angular | NestJS |
|---------|---------|--------|
| **Modules** | @NgModule | @Module |
| **Components** | @Component | @Controller |
| **Services** | @Injectable | @Injectable |
| **DI** | Hierarchical DI | Container-based DI |
| **Decorators** | Metadata decorators | Metadata decorators |
| **Pipes** | Transform data | Transform/validate |
| **Guards** | Route guards | Auth guards |
| **Interceptors** | HTTP interceptors | Request interceptors |

---

## Topic 7.2: Module Structure Comparison

### Angular Module

```typescript
@NgModule({
  imports: [CommonModule, HttpClientModule],
  declarations: [UserComponent, UserListComponent],
  providers: [UserService],
  exports: [UserComponent],
})
export class UserModule {}
```

### NestJS Module

```typescript
@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

---

## Topic 7.3: Component vs Controller

### Angular Component

```typescript
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
})
export class UserComponent {
  constructor(private userService: UserService) {}

  ngOnInit() {
    this.users = this.userService.getUsers();
  }
}
```

### NestJS Controller

```typescript
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getUsers() {
    return this.userService.getUsers();
  }
}
```

---

## Topic 7.4: Dependency Injection

### Same Pattern in Both

```typescript
// Both use constructor injection
@Injectable()
export class UserService {
  constructor(
    private http: HttpClient,        // Angular
    private repository: UserRepository, // NestJS
  ) {}
}

// Both support @Inject for tokens
constructor(@Inject('API_URL') private apiUrl: string) {}

// Both support @Optional
constructor(@Optional() private logger?: LoggerService) {}
```

---

## Topic 7.5: Pipes Comparison

### Angular Pipe

```typescript
@Pipe({ name: 'capitalize' })
export class CapitalizePipe implements PipeTransform {
  transform(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}

// Usage in template
{{ name | capitalize }}
```

### NestJS Pipe

```typescript
@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) throw new BadRequestException('Invalid number');
    return val;
  }
}

// Usage in controller
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {}
```

---

## Topic 7.6: Guards Comparison

### Angular Guard

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.auth.isLoggedIn()) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
```

### NestJS Guard

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return this.auth.validateRequest(request);
  }
}
```

---

## Topic 7.7: Interceptors Comparison

### Angular Interceptor

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer token'),
    });
    return next.handle(authReq);
  }
}
```

### NestJS Interceptor

```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({ data, success: true })),
    );
  }
}
```

---

## Topic 7.8: Why Angular Patterns?

### Benefits

1. **Familiar to Angular developers** - Easy transition to backend
2. **Proven architecture** - Battle-tested in large apps
3. **Strong typing** - TypeScript-first approach
4. **Modularity** - Clear separation of concerns
5. **Testability** - DI makes mocking easy
6. **Scalability** - Modular structure scales well

### Design Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│              Angular/NestJS Design Philosophy               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │  Decorators │───▶│  Metadata   │───▶│  Reflection │    │
│  │  (@Module)  │    │  Storage    │    │  API        │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│                                                │            │
│                                                ▼            │
│                                     ┌─────────────────┐    │
│                                     │  DI Container   │    │
│                                     │  (Resolution)   │    │
│                                     └─────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Summary

- NestJS intentionally adopts Angular's architecture
- Same decorator-based metadata system
- Same DI patterns and philosophy
- Makes full-stack TypeScript development consistent

---

## 🔗 Next

- [08-production-ready.md](./08-production-ready.md) - Production best practices
