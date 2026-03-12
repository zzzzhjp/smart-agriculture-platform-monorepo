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
import { Role } from './role.entity';

@Entity({
  schema: 'crm',
  name: 'role_scope',
})
@Unique('uk_role_scope_unique', ['roleId', 'scopeType', 'scopeValue'])
@Index('idx_role_scope_role_id', ['roleId'])
@Index('idx_role_scope_scope_type', ['scopeType'])
export class RoleScope {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'integer', name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: Role;

  @Column({ type: 'text', name: 'scope_type' })
  scopeType: string;

  @Column({ type: 'text', name: 'scope_value', default: '*' })
  scopeValue: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
