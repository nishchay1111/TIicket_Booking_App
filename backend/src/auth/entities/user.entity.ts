import { Exclude } from 'class-transformer';
import { Role } from '../../RBAC/role.enum';

export class UserEntity {
  user_id!: string;
  user_name!: string;
  user_email!: string;

  @Exclude() // 👈 This property will be stripped during serialization
  user_password!: string;

  role!: Role;
  date_created!: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}