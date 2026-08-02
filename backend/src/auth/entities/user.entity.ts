import { Exclude, Expose, Transform } from 'class-transformer';
import { Role } from '../../RBAC/role.enum';

/**
 * Entity representing a unified application user, mapping properties 
 * dynamically from either standard user or organizer data layouts.
 */
export class UserEntity {

  /**
   * The unique identifier for the user or organizer.
   * Maps from either 'user_id' or 'organizer_id'.
   */
  @Expose()
  @Transform(({ obj }) => obj.user_id || obj.organizer_id)
  user_id!: string;

  /**
   * The display name of the user or organizer.
   * Maps from either 'user_name' or 'organizer_name'.
   */
  @Expose()
  @Transform(({ obj }) => obj.user_name || obj.organizer_name)
  user_name!: string;

  /**
   * The primary email address of the user or organizer.
   * Maps from either 'user_email' or 'organizer_email'.
   */
  @Expose()
  @Transform(({ obj }) => obj.user_email || obj.organizer_email)
  user_email!: string;

  /**
   * The hashed authentication password for a standard user.
   * Excluded from serialization payloads.
   */
  @Exclude()
  user_password!: string;

  /**
   * The hashed authentication password for an organizer profile.
   * Excluded from serialization payloads.
   */
  @Exclude()
  organizer_password!: string;

  /**
   * The Role-Based Access Control authorization tier assigned to the account.
   */
  @Expose()
  @Transform(({ obj }) => obj.role)
  role!: Role;

  /**
   * The ISO timestamp detailing when the account profile was created.
   */
  @Expose()
  date_created!: string;

  /**
   * Creates an instance of UserEntity.
   * @param partial - A partial subset of UserEntity properties to map onto the new instance.
   */
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}