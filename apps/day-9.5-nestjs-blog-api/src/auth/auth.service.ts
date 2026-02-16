import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthorsService } from "../authors/authors.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { Author } from "../authors/entities/author.entity";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => AuthorsService))
    private readonly authorsService: AuthorsService,
    private readonly jwtService: JwtService
  ) {}

  async login(
    loginDto: LoginDto
  ): Promise<{ accessToken: string; user: Author }> {
    const author = await this.authorsService.findByEmail(loginDto.email);

    if (!author || author.password !== loginDto.password) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload: JwtPayload = {
      sub: author.id,
      email: author.email,
      role: author.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: author,
    };
  }
  async register(registerDto: RegisterDto): Promise<{ user: Author }> {
    const author = await this.authorsService.create(registerDto);

    return {
      user: author,
    };
  }
  async validateUser(payload: JwtPayload): Promise<Author | null> {
    return this.authorsService.findById(payload.sub);
  }
}
