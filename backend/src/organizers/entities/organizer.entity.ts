import { Exclude } from 'class-transformer';
import { Role } from '../../RBAC/role.enum';

export class OrganizerEntity {
  organizer_id!: string;
  organizer_name!: string;
  organizer_email!: string;

  @Exclude() // 👈 This property will be stripped during serialization
  organizer_password!: string;

  admin_verification!: number;
  role!: Role;
  date_created!: string;

  constructor(partial: Partial<OrganizerEntity>) {
    Object.assign(this, partial);
  }
}