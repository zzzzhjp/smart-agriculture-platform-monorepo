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
import { NdviDataset } from './ndvi-dataset.entity';
import { Parcel } from './parcel.entity';

@Entity({
  schema: 'crm',
  name: 'flood_analysis_result',
})
@Index('idx_flood_result_farm_id', ['farmId'])
@Index('idx_flood_result_parcel_id', ['parcelId'])
@Index('idx_flood_result_analysis_time', ['analysisTime'])
export class FloodAnalysisResult {
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

  @Column({ type: 'bigint', name: 'source_dataset_id', nullable: true })
  sourceDatasetId: string | null;

  @ManyToOne(() => NdviDataset, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'source_dataset_id', referencedColumnName: 'id' })
  sourceDataset: NdviDataset | null;

  @Column({ type: 'text', name: 'result_code', unique: true })
  resultCode: string;

  @Column({ type: 'text', name: 'result_name' })
  resultName: string;

  @Column({ type: 'timestamptz', name: 'analysis_time' })
  analysisTime: Date;

  @Column({
    type: 'geometry',
    name: 'flood_geom',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
    nullable: true,
  })
  @Index('idx_flood_result_geom', { spatial: true })
  floodGeom: unknown;

  @Column({ type: 'double precision', name: 'water_level_m', nullable: true })
  waterLevelM: number | null;

  @Column({ type: 'double precision', name: 'inundated_area_m2', nullable: true })
  inundatedAreaM2: number | null;

  @Column({ type: 'text', name: 'result_uri', nullable: true })
  resultUri: string | null;

  @Column({ type: 'jsonb', name: 'summary', default: () => "'{}'::jsonb" })
  summary: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
