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
  name: 'agri_feature',
})
@Index('idx_agri_feature_type', ['featureType'])
@Index('idx_agri_feature_status', ['status'])
@Index('idx_agri_feature_owner', ['ownerOrg'])
@Index('idx_agri_feature_time', ['startTime', 'endTime'])
export class AgriFeature {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'text', name: 'feature_code', unique: true, nullable: true })
  featureCode: string | null;

  @Column({ type: 'text', nullable: true })
  name: string | null;

  @Column({ type: 'text', name: 'feature_type' })
  featureType: string;

  @Column({ type: 'text', nullable: true })
  subtype: string | null;

  @Column({ type: 'bigint', name: 'farm_id', nullable: true })
  farmId: string | null;

  @Column({ type: 'bigint', name: 'parcel_id', nullable: true })
  parcelId: string | null;

  @Column({ type: 'bigint', name: 'owner_org_id', nullable: true })
  ownerOrgId: string | null;

  @Column({ type: 'text', name: 'owner_org', nullable: true })
  ownerOrg: string | null;

  @Column({ type: 'text', name: 'owner_person', nullable: true })
  ownerPerson: string | null;

  @Column({ type: 'text', nullable: true })
  manager: string | null;

  @Column({ type: 'text', name: 'permission_tag', nullable: true })
  permissionTag: string | null;

  @Column({ type: 'text', default: 'active' })
  status: string;

  @Column({ type: 'timestamptz', name: 'valid_from', nullable: true })
  validFrom: Date | null;

  @Column({ type: 'timestamptz', name: 'valid_to', nullable: true })
  validTo: Date | null;

  @Column({
    type: 'geometry',
    name: 'geom',
    spatialFeatureType: 'Geometry',
    srid: 4326,
  })
  @Index('idx_agri_feature_geom', { spatial: true })
  geom: unknown;

  @Column({
    type: 'geometry',
    name: 'geom_z',
    spatialFeatureType: 'GeometryZ',
    srid: 4326,
    nullable: true,
  })
  @Index('idx_agri_feature_geom_z', { spatial: true })
  geomZ: unknown;

  @Column({
    type: 'geometry',
    name: 'bbox',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: true,
  })
  @Index('idx_agri_feature_bbox', { spatial: true })
  bbox: unknown;

  @Column({ type: 'double precision', name: 'elev_m', nullable: true })
  elevM: number | null;

  @Column({ type: 'double precision', name: 'z_min_m', nullable: true })
  zMinM: number | null;

  @Column({ type: 'double precision', name: 'z_max_m', nullable: true })
  zMaxM: number | null;

  @Column({ type: 'double precision', name: 'height_m', nullable: true })
  heightM: number | null;

  @Column({
    type: 'double precision',
    name: 'footprint_area_m2',
    nullable: true,
  })
  footprintAreaM2: number | null;

  @Column({ type: 'double precision', name: 'length_m', nullable: true })
  lengthM: number | null;

  @Column({ type: 'integer', name: 'point_count', nullable: true })
  pointCount: number | null;

  @Column({ type: 'bigint', name: 'mission_id', nullable: true })
  missionId: string | null;

  @Column({ type: 'text', name: 'uav_sn', nullable: true })
  uavSn: string | null;

  @Column({ type: 'timestamptz', name: 'start_time', nullable: true })
  startTime: Date | null;

  @Column({ type: 'timestamptz', name: 'end_time', nullable: true })
  endTime: Date | null;

  @Column({ type: 'text', name: 'model_uri', nullable: true })
  modelUri: string | null;

  @Column({ type: 'text', name: 'thumbnail_uri', nullable: true })
  thumbnailUri: string | null;

  @Column({ type: 'text', name: 'extra_uri', nullable: true })
  extraUri: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  attrs: Record<string, unknown>;

  @Column({ type: 'bigint', name: 'created_by', nullable: true })
  createdBy: string | null;

  @Column({ type: 'bigint', name: 'updated_by', nullable: true })
  updatedBy: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
