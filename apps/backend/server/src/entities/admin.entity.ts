import { Role } from './role.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'admin',
  schema: 'crm',
})
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  admin_account: string;

  @Column()
  admin_password: string;

  @ManyToOne(() => Role, (role) => role.admins, { nullable: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
