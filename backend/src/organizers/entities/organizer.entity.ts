import { Exclude } from 'class-transformer';
import { Role } from '../../RBAC/role.enum';

/**
 * Entity representing an organizer profile within the system, managing 
 * account identity, verification status, and security visibility boundaries.
 */
export class OrganizerEntity {
  /**
   * The unique system identifier for the organizer.
   */
  organizer_id!: string;

  /**
   * The formal administrative or display name of the organizer.
   */
  organizer_name!: string;

  /**
   * The primary administrative email address assigned to the organizer account.
   */
  organizer_email!: string;

  /**
   * The hashed authentication credentials for the organizer profile.
   * Excluded from outbound serialization payloads for security verification layers.
   */
  @Exclude()
  organizer_password!: string;

  /**
   * The administrative vetting status indicator flag for platform verification.
   */
  admin_verification!: number;

  /**
   * The Role-Based Access Control authorization tier assigned to the profile.
   */
  role!: Role;

  /**
   * The ISO timestamp detailing when the organizer account was created.
   */
  date_created!: string;

  /**
   * Creates an instance of OrganizerEntity.
   * @param partial - A partial subset of OrganizerEntity properties to map onto the new instance.
   */
  constructor(partial: Partial<OrganizerEntity>) {
    Object.assign(this, partial);
  }
}