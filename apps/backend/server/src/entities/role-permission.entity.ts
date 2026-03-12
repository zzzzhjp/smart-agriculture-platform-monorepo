import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity({
  schema: 'crm',
  name: 'role_permission',
})
@Unique('uk_role_permission_role_perm', ['roleId', 'permissionId'])
@Index('idx_role_permission_role_id', ['roleId'])
@Index('idx_role_permission_permission_id', ['permissionId'])
export class RolePermission {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'integer', name: 'role_id' })
  roleId: number;

  @Column({ type: 'bigint', name: 'permission_id' })
  permissionId: string;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: Role;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id', referencedColumnName: 'id' })
  permission: Permission;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
