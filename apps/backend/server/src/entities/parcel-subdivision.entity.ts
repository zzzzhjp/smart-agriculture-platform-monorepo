import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { AgriFeature } from './agri-feature.entity';
import { Parcel } from './parcel.entity';

@Entity({
  schema: 'crm',
  name: 'parcel_subdivision',
})
@Unique('uk_parcel_subdivision_code', ['parcelId', 'subdivisionCode'])
@Index('idx_parcel_subdivision_parcel_id', ['parcelId'])
export class ParcelSubdivision {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'parcel_id' })
  parcelId: string;

  @ManyToOne(() => Parcel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parcel_id', referencedColumnName: 'id' })
  parcel: Parcel;

  @Column({ type: 'bigint', name: 'feature_id', nullable: true, unique: true })
  featureId: string | null;

  @OneToOne(() => AgriFeature, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'feature_id', referencedColumnName: 'id' })
  feature: AgriFeature | null;

  @Column({ type: 'text', name: 'subdivision_code' })
  subdivisionCode: string;

  @Column({ type: 'text', name: 'subdivision_name' })
  subdivisionName: string;

  @Column({ type: 'text', name: 'subdivision_type' })
  subdivisionType: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
  })
  @Index('idx_parcel_subdivision_geom', { spatial: true })
  geom: unknown;

  @Column({ type: 'double precision', name: 'area_m2', nullable: true })
  areaM2: number | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  attrs: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
