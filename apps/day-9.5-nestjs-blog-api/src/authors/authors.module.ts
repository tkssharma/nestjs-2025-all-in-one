import { Module, forwardRef } from "@nestjs/common";
import { AuthorsController } from "./authors.controller";
import { AuthorsService } from "./authors.service";
import { AuthorsRepository } from "./authors.repository";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [AuthorsController],
  providers: [AuthorsService, AuthorsRepository],
  exports: [AuthorsService, AuthorsRepository],
})
export class AuthorsModule {}
