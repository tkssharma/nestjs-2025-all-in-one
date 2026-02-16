import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { QueryUserDto } from "./dto/query-user.dto";

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "user",
      isActive: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: "3",
      name: "Bob Wilson",
      email: "bob@example.com",
      role: "moderator",
      isActive: false,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01"),
    },
  ];

  findAll(query: QueryUserDto) {
    let filteredUsers = [...this.users];

    // Search filter
    if (query.search) {
      const search = query.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
      );
    }

    // Role filter
    if (query.role) {
      filteredUsers = filteredUsers.filter((user) => user.role === query.role);
    }

    // Sorting
    if (query.sortBy) {
      filteredUsers.sort((a, b) => {
        const aVal = a[query.sortBy as keyof User];
        const bVal = b[query.sortBy as keyof User];
        if (aVal < bVal) return query.sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return query.sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    const total = filteredUsers.length;
    const page = query.page || 1;
    const limit = query.limit || 10;
    const start = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(start, start + limit);

    return {
      data: paginatedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: string): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  create(createUserDto: CreateUserDto): User {
    const existingUser = this.users.find(
      (u) => u.email === createUserDto.email
    );
    if (existingUser) {
      throw new ConflictException(
        `User with email "${createUserDto.email}" already exists`
      );
    }

    const newUser: User = {
      id: uuidv4(),
      name: createUserDto.name,
      email: createUserDto.email,
      role: createUserDto.role || "user",
      isActive: createUserDto.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    return newUser;
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (updateUserDto.email) {
      const existingUser = this.users.find(
        (u) => u.email === updateUserDto.email && u.id !== id
      );
      if (existingUser) {
        throw new ConflictException(
          `User with email "${updateUserDto.email}" already exists`
        );
      }
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateUserDto,
      updatedAt: new Date(),
    };

    return this.users[userIndex];
  }

  remove(id: string): void {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    this.users.splice(userIndex, 1);
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }
}
