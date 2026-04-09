import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AgriFeature } from './agri-feature.entity';
import { Farm } from './farm.entity';
import { Parcel } from './parcel.entity';

@Entity({
  schema: 'crm',
  name: 'facility',
})
@Index('idx_facility_farm_id', ['farmId'])
@Index('idx_facility_parcel_id', ['parcelId'])
export class Facility {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'feature_id', nullable: true, unique: true })
  featureId: string | null;

  @OneToOne(() => AgriFeature, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'feature_id', referencedColumnName: 'id' })
  feature: AgriFeature | null;

  @Column({ type: 'bigint', name: 'farm_id' })
  farmId: string;

  @ManyToOne(() => Farm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id', referencedColumnName: 'id' })
  farm: Farm;

  @Column({ type: 'bigint', name: 'parcel_id', nullable: true })
  parcelId: string | null;

  @ManyToOne(() => Parcel, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parcel_id', referencedColumnName: 'id' })
  parcel: Parcel | null;

  @Column({ type: 'text', name: 'facility_code', unique: true })
  facilityCode: string;

  @Column({ type: 'text', name: 'facility_name' })
  facilityName: string;

  @Column({ type: 'text', name: 'facility_type' })
  facilityType: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index('idx_facility_geom', { spatial: true })
  geom: unknown;

  @Column({ type: 'double precision', name: 'elevation_m', nullable: true })
  elevationM: number | null;

  @Column({ type: 'text', name: 'model_uri', nullable: true })
  modelUri: string | null;

  @Column({ type: 'text', name: 'tileset_uri', nullable: true })
  tilesetUri: string | null;

  @Column({ type: 'text', name: 'thumbnail_uri', nullable: true })
  thumbnailUri: string | null;

  @Column({ type: 'text', default: 'active' })
  status: string;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  attrs: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
