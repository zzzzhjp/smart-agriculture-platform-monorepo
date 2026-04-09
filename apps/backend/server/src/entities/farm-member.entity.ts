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
import { Employee } from './employee.entity';
import { Farm } from './farm.entity';

@Entity({
  schema: 'crm',
  name: 'farm_member',
})
@Unique('uk_farm_member_unique', ['farmId', 'employeeId', 'memberRole'])
@Index('idx_farm_member_farm_id', ['farmId'])
@Index('idx_farm_member_employee_id', ['employeeId'])
export class FarmMember {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'farm_id' })
  farmId: string;

  @Column({ type: 'integer', name: 'employee_id' })
  employeeId: number;

  @ManyToOne(() => Farm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id', referencedColumnName: 'id' })
  farm: Farm;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id', referencedColumnName: 'id' })
  employee: Employee;

  @Column({ type: 'text', name: 'member_role' })
  memberRole: string;

  @Column({ type: 'boolean', name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ type: 'timestamptz', name: 'joined_at', default: () => 'now()' })
  joinedAt: Date;

  @Column({ type: 'timestamptz', name: 'left_at', nullable: true })
  leftAt: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  attrs: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
