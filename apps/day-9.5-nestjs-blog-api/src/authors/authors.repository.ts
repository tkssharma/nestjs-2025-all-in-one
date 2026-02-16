import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { Author } from "./entities/author.entity";
import { Role } from "../common/decorators/roles.decorator";

@Injectable()
export class AuthorsRepository {
  private authors: Map<string, Author> = new Map();

  constructor() {
    // Seed with demo data
    const admin = new Author({
      id: uuidv4(),
      email: "admin@blog.com",
      password: "admin123", // In real app, this would be hashed
      name: "Admin User",
      bio: "Platform administrator",
      role: Role.ADMIN,
    });
    const user = new Author({
      id: uuidv4(),
      email: "user@blog.com",
      password: "user123",
      name: "Regular User",
      bio: "A passionate blogger",
      role: Role.USER,
    });
    this.authors.set(admin.id, admin);
    this.authors.set(user.id, user);
  }

  async findAll(): Promise<Author[]> {
    return Array.from(this.authors.values());
  }

  async findById(id: string): Promise<Author | undefined> {
    return this.authors.get(id);
  }

  async findByEmail(email: string): Promise<Author | undefined> {
    return Array.from(this.authors.values()).find((a) => a.email === email);
  }

  async create(data: Partial<Author>): Promise<Author> {
    const author = new Author({
      ...data,
      id: uuidv4(),
    });
    this.authors.set(author.id, author);
    return author;
  }

  async update(id: string, data: Partial<Author>): Promise<Author | undefined> {
    const author = this.authors.get(id);
    if (!author) return undefined;

    const updated = new Author({
      ...author,
      ...data,
      updatedAt: new Date(),
    });
    this.authors.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.authors.delete(id);
  }
}
