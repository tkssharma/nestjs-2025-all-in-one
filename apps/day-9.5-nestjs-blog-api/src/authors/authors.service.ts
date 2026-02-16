import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AuthorsRepository } from "./authors.repository";
import { CreateAuthorDto } from "./dto/create-author.dto";
import { UpdateAuthorDto } from "./dto/update-author.dto";
import { Author } from "./entities/author.entity";

@Injectable()
export class AuthorsService {
  constructor(
    private readonly authorsRepository: AuthorsRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async findAll(): Promise<Author[]> {
    return this.authorsRepository.findAll();
  }

  async findById(id: string): Promise<Author> {
    const author = await this.authorsRepository.findById(id);
    if (!author) {
      throw new NotFoundException(`Author with ID "${id}" not found`);
    }
    return author;
  }

  async findByEmail(email: string): Promise<Author | undefined> {
    return this.authorsRepository.findByEmail(email);
  }

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const existing = await this.authorsRepository.findByEmail(
      createAuthorDto.email
    );
    if (existing) {
      throw new ConflictException("Email already exists");
    }

    const author = await this.authorsRepository.create(createAuthorDto);

    // Emit event for other modules to react
    this.eventEmitter.emit("author.created", { author });

    return author;
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    await this.findById(id); // Throws if not found

    if (updateAuthorDto.email) {
      const existing = await this.authorsRepository.findByEmail(
        updateAuthorDto.email
      );
      if (existing && existing.id !== id) {
        throw new ConflictException("Email already exists");
      }
    }

    const updated = await this.authorsRepository.update(id, updateAuthorDto);
    if (!updated) {
      throw new NotFoundException(`Author with ID "${id}" not found`);
    }

    this.eventEmitter.emit("author.updated", { author: updated });

    return updated;
  }

  async delete(id: string): Promise<void> {
    const author = await this.findById(id);
    await this.authorsRepository.delete(id);

    this.eventEmitter.emit("author.deleted", { authorId: id, author });
  }
}
