import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { NewUser } from '@app/database';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('find_all_users')
  findAll() {
    return this.userService.findAll();
  }

  @MessagePattern('find_user_by_email')
  findByEmail(@Payload() email: string) {
    return this.userService.findByEmail(email);
  }

  @MessagePattern('find_user_by_id')
  findById(@Payload() id: number) {
    return this.userService.findById(id);
  }

  @MessagePattern('create_user')
  create(@Payload() data: NewUser) {
    return this.userService.create(data);
  }

  @MessagePattern('update_user')
  update(@Payload() payload: { id: number; data: Partial<NewUser> }) {
    return this.userService.update(payload.id, payload.data);
  }

  @MessagePattern('update_profile')
  updateProfile(
    @Payload()
    payload: {
      id: number;
      data: {
        name?: string;
        firstname?: string;
        phone?: string;
        address?: { street?: string; city?: string; country?: string };
      };
    },
  ) {
    return this.userService.updateProfile(payload.id, payload.data);
  }
}
