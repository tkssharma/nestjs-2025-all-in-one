import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserLists } from './user.model';
import { ConfigService } from '@nestjs/config';
import { TaskService } from '../task/task.service';

@Injectable()
export class UserService {
  constructor(private readonly configService: ConfigService) {}
  private Users: User[] = UserLists;

  create(User: User) {
    console.log(this.configService.get('database'));
    this.Users.push({
      ...User,
      id: this.Users.length + 1,
    });
    return User;
  }
  findAll() {
    console.log(this.configService.get('database'));

    return this.Users;
  }
  deleteUser(id: number) {
    const User = this.Users.find((i) => i.id === id);
    if (!User) {
      throw new NotFoundException();
    }

    this.Users = this.Users.filter((i) => i.id !== id);
    return null;
  }
  updateUser(id: number, payload: Partial<User>) {
    const User = this.Users.find((i) => i.id === id);
    if (!User) {
      throw new NotFoundException();
    }
    this.Users = this.Users.map((i) => {
      if (i.id === id) {
        return { ...i, ...payload };
      }
      return i;
    });
    return User.id;
  }
}
