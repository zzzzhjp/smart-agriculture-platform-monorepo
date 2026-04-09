import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Parcel } from './parcel.entity';

@Entity({
  schema: 'crm',
  name: 'parcel_edit_log',
})
@Index('idx_parcel_edit_log_parcel_id', ['parcelId', 'createdAt'])
export class ParcelEditLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'parcel_id' })
  parcelId: string;

  @ManyToOne(() => Parcel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parcel_id', referencedColumnName: 'id' })
  parcel: Parcel;

  @Column({ type: 'integer', name: 'edited_by_admin_id', nullable: true })
  editedByAdminId: number | null;

  @ManyToOne(() => Admin, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'edited_by_admin_id', referencedColumnName: 'id' })
  editedByAdmin: Admin | null;

  @Column({ type: 'text' })
  operation: string;

  @Column({ type: 'text', array: true, name: 'changed_fields', nullable: true })
  changedFields: string[] | null;

  @Column({ type: 'jsonb', name: 'before_data', nullable: true })
  beforeData: Record<string, unknown> | null;

  @Column({ type: 'jsonb', name: 'after_data', nullable: true })
  afterData: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
