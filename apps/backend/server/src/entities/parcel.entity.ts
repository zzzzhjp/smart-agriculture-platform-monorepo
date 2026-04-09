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
import { Employee } from './employee.entity';
import { Farm } from './farm.entity';
import { FloodAnalysisResult } from './flood-analysis-result.entity';
import { NdviDataset } from './ndvi-dataset.entity';
import { Organization } from './organization.entity';
import { UavMission } from './uav-mission.entity';

@Entity({
  schema: 'crm',
  name: 'parcel',
})
@Index('idx_parcel_farm_id', ['farmId'])
@Index('idx_parcel_owner_org_id', ['ownerOrgId'])
@Index('idx_parcel_active_valid', ['isActive', 'validFrom', 'validTo'])
export class Parcel {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'feature_id', nullable: true, unique: true })
  featureId: string | null;

  @OneToOne(() => AgriFeature, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'feature_id', referencedColumnName: 'id' })
  feature: AgriFeature | null;

  @Column({ type: 'text', name: 'parcel_code', unique: true })
  parcelCode: string;

  @Column({ type: 'text', name: 'parcel_name' })
  parcelName: string;

  @Column({ type: 'bigint', name: 'farm_id' })
  farmId: string;

  @ManyToOne(() => Farm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id', referencedColumnName: 'id' })
  farm: Farm;

  @Column({ type: 'bigint', name: 'owner_org_id', nullable: true })
  ownerOrgId: string | null;

  @ManyToOne(() => Organization, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_org_id', referencedColumnName: 'id' })
  ownerOrganization: Organization | null;

  @Column({ type: 'integer', name: 'manager_employee_id', nullable: true })
  managerEmployeeId: number | null;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'manager_employee_id', referencedColumnName: 'id' })
  managerEmployee: Employee | null;

  @Column({ type: 'bigint', name: 'current_crop_id', nullable: true })
  currentCropId: string | null;

  @Column({ type: 'text', name: 'land_use_type', nullable: true })
  landUseType: string | null;

  @Column({ type: 'text', name: 'soil_type', nullable: true })
  soilType: string | null;

  @Column({ type: 'text', name: 'irrigation_type', nullable: true })
  irrigationType: string | null;

  @Column({ type: 'text', name: 'cultivation_status', nullable: true })
  cultivationStatus: string | null;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
  })
  @Index('idx_parcel_geom', { spatial: true })
  geom: unknown;

  @Column({
    type: 'geometry',
    name: 'centroid_geom',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  centroidGeom: unknown;

  @Column({
    type: 'geometry',
    name: 'bbox',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: true,
  })
  @Index('idx_parcel_bbox', { spatial: true })
  bbox: unknown;

  @Column({ type: 'double precision', name: 'area_m2', nullable: true })
  areaM2: number | null;

  @Column({ type: 'double precision', name: 'perimeter_m', nullable: true })
  perimeterM: number | null;

  @Column({ type: 'double precision', name: 'elevation_avg_m', nullable: true })
  elevationAvgM: number | null;

  @Column({ type: 'double precision', name: 'slope_avg', nullable: true })
  slopeAvg: number | null;

  @Column({ type: 'double precision', name: 'aspect_main', nullable: true })
  aspectMain: number | null;

  @Column({ type: 'bigint', name: 'latest_ndvi_dataset_id', nullable: true })
  latestNdviDatasetId: string | null;

  @ManyToOne(() => NdviDataset, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'latest_ndvi_dataset_id', referencedColumnName: 'id' })
  latestNdviDataset: NdviDataset | null;

  @Column({ type: 'bigint', name: 'latest_flood_result_id', nullable: true })
  latestFloodResultId: string | null;

  @ManyToOne(() => FloodAnalysisResult, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'latest_flood_result_id', referencedColumnName: 'id' })
  latestFloodResult: FloodAnalysisResult | null;

  @Column({ type: 'bigint', name: 'latest_uav_mission_id', nullable: true })
  latestUavMissionId: string | null;

  @ManyToOne(() => UavMission, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'latest_uav_mission_id', referencedColumnName: 'id' })
  latestUavMission: UavMission | null;

  @Column({ type: 'timestamptz', name: 'valid_from', nullable: true })
  validFrom: Date | null;

  @Column({ type: 'timestamptz', name: 'valid_to', nullable: true })
  validTo: Date | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'integer', name: 'version_no', default: 1 })
  versionNo: number;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  @Index('idx_parcel_attrs', { synchronize: false })
  attrs: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
