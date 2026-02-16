# 4. Validation & Transformation

NestJS provides powerful validation and transformation through pipes and decorators.

---

## Libraries

| Library | Purpose | Approach |
|---------|---------|----------|
| **class-validator** | Decorator-based validation | DTOs |
| **class-transformer** | Object transformation | Decorators |
| **zod** | Schema-based validation | Functional |
| **joi** | Schema validation | Object schemas |

---

## How Nest Integrates

```
Request → Pipe → Controller → Service
           │
           ▼
    ┌──────────────┐
    │ ValidationPipe│
    │   - validate │
    │   - transform│
    └──────────────┘
```

---

## class-validator + class-transformer

### Installation
```bash
npm install class-validator class-transformer
```

### Global Validation Pipe
```ts
// main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip non-decorated properties
      forbidNonWhitelisted: true, // Throw error for extra properties
      transform: true,            // Auto-transform to DTO types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  await app.listen(3000);
}
```

### DTO with Validation
```ts
import { IsString, IsEmail, IsInt, Min, Max, IsOptional, Length, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @Length(2, 50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 100)
  password: string;

  @IsInt()
  @Min(0)
  @Max(120)
  @IsOptional()
  age?: number;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @Transform(({ value }) => value.trim().toLowerCase())
  @IsString()
  username: string;
}
```

---

## Common Validators

```ts
// String validators
@IsString()
@IsNotEmpty()
@Length(min, max)
@MinLength(min)
@MaxLength(max)
@Matches(regex)
@IsAlpha()
@IsAlphanumeric()

// Number validators
@IsNumber()
@IsInt()
@IsPositive()
@IsNegative()
@Min(value)
@Max(value)

// Boolean
@IsBoolean()

// Date
@IsDate()
@MinDate(date)
@MaxDate(date)
@IsDateString()

// Array
@IsArray()
@ArrayMinSize(size)
@ArrayMaxSize(size)
@ArrayUnique()

// Object
@IsObject()
@ValidateNested()
@Type(() => NestedDto)

// Special
@IsEmail()
@IsUrl()
@IsUUID()
@IsEnum(enum)
@IsOptional()
@IsDefined()
```

---

## Nested Object Validation

```ts
import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';

export class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  @Length(5, 10)
  zipCode: string;
}

export class CreateUserDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses: AddressDto[];
}
```

---

## Custom Validators

```ts
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: true })
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private usersService: UsersService) {}

  async validate(email: string) {
    const user = await this.usersService.findByEmail(email);
    return !user;
  }

  defaultMessage() {
    return 'Email $value already exists';
  }
}

export function IsEmailUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailUniqueConstraint,
    });
  };
}

// Usage
export class CreateUserDto {
  @IsEmail()
  @IsEmailUnique()
  email: string;
}
```

---

## Transformation

```ts
import { Transform, Type, Expose, Exclude } from 'class-transformer';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ value }) => value.toUpperCase())
  name: string;

  @Exclude()
  password: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose({ name: 'fullName' })
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

---

## Zod Integration

### Installation
```bash
npm install zod
```

### Zod Validation Pipe
```ts
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.errors);
    }
    return result.data;
  }
}
```

### Usage with Zod
```ts
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

type CreateUserDto = z.infer<typeof createUserSchema>;

@Post()
@UsePipes(new ZodValidationPipe(createUserSchema))
create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

---

## Validation Groups

```ts
export class CreateUserDto {
  @IsString({ groups: ['create', 'update'] })
  name: string;

  @IsEmail({ groups: ['create'] })
  email: string;

  @IsString({ groups: ['create'] })
  password: string;
}

// Use specific groups
@Post()
@UsePipes(new ValidationPipe({ groups: ['create'] }))
create(@Body() dto: CreateUserDto) {}

@Patch(':id')
@UsePipes(new ValidationPipe({ groups: ['update'] }))
update(@Body() dto: CreateUserDto) {}
```

---

## Best Practices

1. **Always use whitelist: true** to strip unknown properties
2. **Enable transform** for automatic type conversion
3. **Use forbidNonWhitelisted** in strict APIs
4. **Create separate DTOs** for create/update operations
5. **Use PartialType/OmitType** from `@nestjs/mapped-types`
6. **Validate nested objects** with @ValidateNested()
7. **Custom messages** for better UX
