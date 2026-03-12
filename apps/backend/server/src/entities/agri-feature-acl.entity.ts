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
import { AgriFeature } from './agri-feature.entity';

@Entity({
  schema: 'crm',
  name: 'agri_feature_acl',
})
@Unique('uk_agri_feature_acl_subject_feature', [
  'subjectType',
  'subjectId',
  'featureId',
])
@Index('idx_agri_feature_acl_subject', ['subjectType', 'subjectId'])
@Index('idx_agri_feature_acl_feature_id', ['featureId'])
export class AgriFeatureAcl {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'text', name: 'subject_type' })
  subjectType: string;

  @Column({ type: 'bigint', name: 'subject_id' })
  subjectId: string;

  @Column({ type: 'bigint', name: 'feature_id' })
  featureId: string;

  @ManyToOne(() => AgriFeature, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feature_id', referencedColumnName: 'id' })
  feature: AgriFeature;

  @Column({ type: 'boolean', name: 'can_read', default: false })
  canRead: boolean;

  @Column({ type: 'boolean', name: 'can_update', default: false })
  canUpdate: boolean;

  @Column({ type: 'boolean', name: 'can_delete', default: false })
  canDelete: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
