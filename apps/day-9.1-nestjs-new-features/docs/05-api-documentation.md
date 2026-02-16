# 5. API Documentation & Schema

NestJS provides first-class support for auto-generating API documentation and type-safe schemas.

---

## Libraries

| Library | Purpose | Package |
|---------|---------|---------|
| **Swagger/OpenAPI** | REST API docs | `@nestjs/swagger` |
| **GraphQL** | Query language | `@nestjs/graphql` |
| **gRPC** | RPC framework | `@nestjs/microservices` |

---

## Swagger / OpenAPI

### Installation
```bash
npm install @nestjs/swagger swagger-ui-express
```

### Setup
```ts
// main.ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('users')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
```

### Controller Decorators
```ts
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserDto] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.findAll({ page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User found', type: UserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created', type: UserDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

### DTO Decorators
```ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'User age',
    example: 25,
    minimum: 0,
    maximum: 120,
  })
  @IsOptional()
  @IsInt()
  age?: number;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    default: UserRole.USER,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
```

### Auto-generate from Decorators
Enable the Swagger CLI plugin in `nest-cli.json`:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "classValidatorShim": true,
          "introspectComments": true
        }
      }
    ]
  }
}
```

---

## GraphQL

### Installation
```bash
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
```

### Setup (Code-First)
```ts
// app.module.ts
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
    }),
  ],
})
export class AppModule {}
```

### Object Types
```ts
import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => Int, { nullable: true })
  age?: number;

  @Field(() => [Post])
  posts: Post[];
}
```

### Input Types
```ts
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  age?: number;
}
```

### Resolvers
```ts
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserInput) {
    return this.usersService.create(input);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.remove(id);
  }
}
```

---

## gRPC

### Installation
```bash
npm install @nestjs/microservices @grpc/grpc-js @grpc/proto-loader
```

### Proto File
```protobuf
// users.proto
syntax = "proto3";

package users;

service UsersService {
  rpc FindOne (UserById) returns (User);
  rpc FindAll (Empty) returns (Users);
}

message UserById {
  int32 id = 1;
}

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}

message Users {
  repeated User users = 1;
}

message Empty {}
```

### gRPC Server
```ts
// main.ts
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'users',
        protoPath: join(__dirname, 'users.proto'),
        url: 'localhost:5000',
      },
    },
  );
  await app.listen();
}
```

### Controller
```ts
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class UsersController {
  @GrpcMethod('UsersService', 'FindOne')
  findOne(data: { id: number }) {
    return this.usersService.findOne(data.id);
  }

  @GrpcMethod('UsersService', 'FindAll')
  findAll() {
    return { users: this.usersService.findAll() };
  }
}
```

---

## Best Practices

1. **Document all endpoints** with @ApiOperation
2. **Use examples** in @ApiProperty for better docs
3. **Group endpoints** with @ApiTags
4. **Document error responses** with @ApiResponse
5. **Use DTOs** for request/response types
6. **Enable Swagger plugin** for automatic schema generation
7. **Version your API** using @ApiVersion or URL versioning
