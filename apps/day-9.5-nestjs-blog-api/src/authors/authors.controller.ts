import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { AuthorsService } from "./authors.service";
import { CreateAuthorDto } from "./dto/create-author.dto";
import { UpdateAuthorDto } from "./dto/update-author.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles, Role } from "../common/decorators/roles.decorator";
import { Public } from "../common/decorators/public.decorator";

@ApiTags("Authors")
@Controller("authors")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Get all authors" })
  @ApiResponse({ status: 200, description: "List of all authors" })
  findAll() {
    return this.authorsService.findAll();
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Get author by ID" })
  @ApiResponse({ status: 200, description: "Author found" })
  @ApiResponse({ status: 404, description: "Author not found" })
  findOne(@Param("id") id: string) {
    return this.authorsService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Create new author (Admin only)" })
  @ApiResponse({ status: 201, description: "Author created" })
  @ApiResponse({ status: 409, description: "Email already exists" })
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorsService.create(createAuthorDto);
  }

  @Put(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Update author (Admin only)" })
  @ApiResponse({ status: 200, description: "Author updated" })
  @ApiResponse({ status: 404, description: "Author not found" })
  update(@Param("id") id: string, @Body() updateAuthorDto: UpdateAuthorDto) {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete author (Admin only)" })
  @ApiResponse({ status: 204, description: "Author deleted" })
  @ApiResponse({ status: 404, description: "Author not found" })
  remove(@Param("id") id: string) {
    return this.authorsService.delete(id);
  }
}
