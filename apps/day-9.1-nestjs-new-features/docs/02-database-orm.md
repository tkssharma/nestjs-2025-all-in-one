# 2. Database & ORM Integrations

NestJS integrates seamlessly with various databases and ORMs through dedicated modules and custom providers.

---

## Supported ORMs & Databases

| ORM/Database | Package | Database Support |
|--------------|---------|------------------|
| **TypeORM** | `@nestjs/typeorm` | PostgreSQL, MySQL, SQLite, MSSQL, MongoDB |
| **Prisma** | Custom provider | PostgreSQL, MySQL, SQLite, MongoDB, SQL Server |
| **Mongoose** | `@nestjs/mongoose` | MongoDB |
| **Sequelize** | `@nestjs/sequelize` | PostgreSQL, MySQL, SQLite, MSSQL |
| **Drizzle** | Custom provider | PostgreSQL, MySQL, SQLite |
| **MikroORM** | `@mikro-orm/nestjs` | PostgreSQL, MySQL, SQLite, MongoDB |

---

## Key Concept

Database clients are **providers** - they're injected via Dependency Injection:

```ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
}
```

---

## TypeORM Integration

### Installation
```bash
npm install @nestjs/typeorm typeorm pg
```

### Configuration
```ts
// app.module.ts
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'mydb',
      entities: [User],
      synchronize: true, // Don't use in production!
    }),
    TypeOrmModule.forFeature([User]),
  ],
})
export class AppModule {}
```

### Entity Definition
```ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;
}
```

### Repository Injection
```ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  create(userData: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }
}
```

---

## Prisma Integration

### Installation
```bash
npm install prisma @prisma/client
npx prisma init
```

### Prisma Service
```ts
// prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### Prisma Module
```ts
// prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### Usage
```ts
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }
}
```

---

## Mongoose Integration (MongoDB)

### Installation
```bash
npm install @nestjs/mongoose mongoose
```

### Configuration
```ts
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/mydb'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class AppModule {}
```

### Schema Definition
```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true })
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### Model Injection
```ts
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  create(userData: CreateUserDto): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }
}
```

---

## Drizzle ORM Integration

### Installation
```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

### Drizzle Service
```ts
import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

@Injectable()
export class DrizzleService {
  private client = postgres(process.env.DATABASE_URL);
  public db = drizzle(this.client, { schema });
}
```

### Schema
```ts
// schema.ts
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
});
```

---

## Async Configuration

For production, use async configuration with ConfigService:

```ts
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
  }),
});
```

---

## Best Practices

1. **Use migrations** in production, not `synchronize: true`
2. **Create a database module** for clean separation
3. **Use async configuration** with environment variables
4. **Implement repository pattern** for complex queries
5. **Use transactions** for multi-step operations
6. **Index frequently queried columns**
