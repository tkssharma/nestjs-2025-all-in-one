import { BaseEntity } from "../../common/entities/base.entity";
import { Role } from "../../common/decorators/roles.decorator";

export class Author extends BaseEntity {
  email: string;
  password: string;
  name: string;
  bio?: string;
  role: Role;
  isActive: boolean;

  constructor(partial: Partial<Author>) {
    super(partial);
    Object.assign(this, partial);
    this.role = this.role || Role.USER;
    this.isActive = this.isActive ?? true;
  }

  toJSON() {
    const { password, ...result } = this as any;
    return result;
  }
}
