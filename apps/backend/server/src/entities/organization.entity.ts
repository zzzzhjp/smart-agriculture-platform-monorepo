import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  schema: 'crm',
  name: 'organization',
})
@Index('idx_organization_parent_id', ['parentId'])
export class Organization {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'parent_id', nullable: true })
  parentId: string | null;

  @Column({ type: 'text', name: 'org_code', unique: true })
  orgCode: string;

  @Column({ type: 'text', name: 'org_name' })
  orgName: string;

  @Column({ type: 'text', name: 'org_type' })
  orgType: string;

  @Column({ type: 'integer', name: 'level_no', default: 1 })
  levelNo: number;

  @Column({ type: 'text', nullable: true })
  path: string | null;

  @Column({ type: 'text', default: 'active' })
  status: string;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  attrs: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
