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
import { UavMission } from './uav-mission.entity';

@Entity({
  schema: 'crm',
  name: 'ndvi_dataset',
})
@Index('idx_ndvi_dataset_farm_id', ['farmId'])
@Index('idx_ndvi_dataset_parcel_id', ['parcelId'])
@Index('idx_ndvi_dataset_acquired_at', ['acquiredAt'])
export class NdviDataset {
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

  @Column({ type: 'bigint', name: 'mission_id', nullable: true })
  missionId: string | null;

  @ManyToOne(() => UavMission, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'mission_id', referencedColumnName: 'id' })
  mission: UavMission | null;

  @Column({ type: 'text', name: 'dataset_code', unique: true })
  datasetCode: string;

  @Column({ type: 'text', name: 'dataset_name' })
  datasetName: string;

  @Column({ type: 'timestamptz', name: 'acquired_at' })
  acquiredAt: Date;

  @Column({ type: 'text', name: 'raster_uri' })
  rasterUri: string;

  @Column({ type: 'text', name: 'point_cloud_uri', nullable: true })
  pointCloudUri: string | null;

  @Column({ type: 'text', name: 'thumbnail_uri', nullable: true })
  thumbnailUri: string | null;

  @Column({
    type: 'geometry',
    name: 'preview_geom',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
    nullable: true,
  })
  @Index('idx_ndvi_dataset_preview_geom', { spatial: true })
  previewGeom: unknown;

  @Column({ type: 'double precision', name: 'ndvi_min', nullable: true })
  ndviMin: number | null;

  @Column({ type: 'double precision', name: 'ndvi_max', nullable: true })
  ndviMax: number | null;

  @Column({ type: 'double precision', name: 'ndvi_avg', nullable: true })
  ndviAvg: number | null;

  @Column({ type: 'jsonb', name: 'stats', default: () => "'{}'::jsonb" })
  stats: Record<string, unknown>;

  @Column({ type: 'timestamptz', name: 'valid_from', nullable: true })
  validFrom: Date | null;

  @Column({ type: 'timestamptz', name: 'valid_to', nullable: true })
  validTo: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
