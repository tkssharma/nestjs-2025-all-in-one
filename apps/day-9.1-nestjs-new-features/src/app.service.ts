import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello from Day 9.1 - NestJS New Features!";
  }
}
