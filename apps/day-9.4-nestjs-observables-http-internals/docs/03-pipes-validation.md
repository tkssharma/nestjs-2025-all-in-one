# Pipes & Validation Beyond Basics

## Built-in Pipes

### ParseIntPipe with Custom Error

```typescript
@Get(':id')
findOne(
  @Param('id', new ParseIntPipe({
    errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
    exceptionFactory: (error) => {
      return new BadRequestException(`"${error}" is not a valid ID`);
    },
  }))
  id: number,
) {}
```

### ParseBoolPipe

```typescript
@Get()
find(@Query('active', new ParseBoolPipe({ optional: true })) active?: boolean) {}
// Accepts: true, false, 1, 0
```

### ParseArrayPipe

```typescript
@Get()
find(
  @Query('ids', new ParseArrayPipe({
    items: Number,
    separator: ',',
    optional: false,
  }))
  ids: number[],
) {}
// ?ids=1,2,3 → [1, 2, 3]
```

### ParseEnumPipe

```typescript
enum UserRole { ADMIN = 'admin', USER = 'user' }

@Get(':role')
findByRole(@Param('role', new ParseEnumPipe(UserRole)) role: UserRole) {}
```

### DefaultValuePipe

```typescript
@Get()
findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
) {}
```

---

## Pipe Chaining

Pipes execute **left-to-right**:

```typescript
@Query('value', new DefaultValuePipe('100'), ParseIntPipe)
// 1. DefaultValue: undefined → '100'
// 2. ParseInt: '100' → 100
```

---

## Advanced Validation Patterns

### Conditional Validation

```typescript
export class CreateOrderDto {
  type: 'regular' | 'premium';

  @ValidateIf(o => o.type === 'premium')
  @IsNotEmpty()
  subscriptionId: string;
}
```

### Transform Before Validation

```typescript
export class CreateUserDto {
  @Transform(({ value }) => value.toLowerCase().trim())
  @IsEmail()
  email: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  name: string;
}
```

### Nested Object Validation

```typescript
export class CreateUserDto {
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
```

### Array Validation

```typescript
export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
}
```

---

## Validation Groups

Different validation rules for create vs update:

```typescript
export class UserDto {
  @IsNotEmpty({ groups: ['create'] })
  @IsOptional({ groups: ['update'] })
  name: string;

  @IsEmail({}, { groups: ['create', 'update'] })
  email: string;
}

// Controller
@Post()
@UsePipes(new ValidationPipe({ groups: ['create'] }))
create(@Body() dto: UserDto) {}

@Patch(':id')
@UsePipes(new ValidationPipe({ groups: ['update'] }))
update(@Body() dto: UserDto) {}
```

---

## Custom Validation Decorators

### Reusable Composed Decorator

```typescript
export function IsStrongPassword() {
  return applyDecorators(
    MinLength(8),
    Matches(/[A-Z]/, { message: 'Must contain uppercase' }),
    Matches(/[0-9]/, { message: 'Must contain number' }),
    Matches(/[!@#$%]/, { message: 'Must contain special char' }),
  );
}

// Usage
export class RegisterDto {
  @IsStrongPassword()
  password: string;
}
```

### Custom Validator

```typescript
@ValidatorConstraint({ async: true })
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private userService: UserService) {}

  async validate(email: string) {
    const user = await this.userService.findByEmail(email);
    return !user;
  }

  defaultMessage() {
    return 'Email already exists';
  }
}

export function IsEmailUnique(options?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsEmailUniqueConstraint,
    });
  };
}
```

---

## ValidationPipe Options

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // Strip unknown properties
  forbidNonWhitelisted: true, // Throw on unknown properties
  transform: true,           // Auto-transform to DTO type
  transformOptions: {
    enableImplicitConversion: true,
  },
  disableErrorMessages: false, // Set true in production
  exceptionFactory: (errors) => {
    // Custom error format
    return new BadRequestException({
      statusCode: 400,
      errors: errors.map(e => ({
        field: e.property,
        messages: Object.values(e.constraints),
      })),
    });
  },
}));
```

---

## Performance Tips

- Use `whitelist: true` to strip unknown properties
- Use `forbidNonWhitelisted: true` to reject unknown
- Skip validation for internal endpoints
- Cache transformed classes where possible
- Avoid complex async validators on hot paths
