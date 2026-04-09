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
  name: 'water_body',
})
@Index('idx_water_body_farm_id', ['farmId'])
@Index('idx_water_body_parcel_id', ['parcelId'])
export class WaterBody {
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

  @Column({ type: 'text', name: 'water_body_code', unique: true })
  waterBodyCode: string;

  @Column({ type: 'text', name: 'water_body_name' })
  waterBodyName: string;

  @Column({ type: 'text', name: 'water_body_type' })
  waterBodyType: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
  })
  @Index('idx_water_body_geom', { spatial: true })
  geom: unknown;

  @Column({ type: 'double precision', name: 'area_m2', nullable: true })
  areaM2: number | null;

  @Column({ type: 'double precision', name: 'avg_depth_m', nullable: true })
  avgDepthM: number | null;

  @Column({ type: 'text', default: 'active' })
  status: string;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  attrs: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
