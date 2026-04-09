import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Parcel } from './parcel.entity';

@Entity({
  schema: 'crm',
  name: 'parcel_version',
})
@Unique('uk_parcel_version_unique', ['parcelId', 'versionNo'])
@Index('idx_parcel_version_parcel_id', ['parcelId', 'versionNo'])
export class ParcelVersion {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'parcel_id' })
  parcelId: string;

  @ManyToOne(() => Parcel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parcel_id', referencedColumnName: 'id' })
  parcel: Parcel;

  @Column({ type: 'integer', name: 'version_no' })
  versionNo: number;

  @Column({ type: 'integer', name: 'edited_by_admin_id', nullable: true })
  editedByAdminId: number | null;

  @ManyToOne(() => Admin, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'edited_by_admin_id', referencedColumnName: 'id' })
  editedByAdmin: Admin | null;

  @Column({ type: 'text', name: 'edit_action', default: 'update' })
  editAction: string;

  @Column({ type: 'jsonb' })
  snapshot: Record<string, unknown>;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
  })
  @Index('idx_parcel_version_geom', { spatial: true })
  geom: unknown;

  @Column({ type: 'double precision', name: 'area_m2', nullable: true })
  areaM2: number | null;

  @Column({ type: 'timestamptz', name: 'valid_from', nullable: true })
  validFrom: Date | null;

  @Column({ type: 'timestamptz', name: 'valid_to', nullable: true })
  validTo: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
