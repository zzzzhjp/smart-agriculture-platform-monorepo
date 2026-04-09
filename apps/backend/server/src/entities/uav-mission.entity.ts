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
  name: 'uav_mission',
})
@Index('idx_uav_mission_farm_id', ['farmId'])
@Index('idx_uav_mission_parcel_id', ['parcelId'])
@Index('idx_uav_mission_time', ['startedAt', 'endedAt'])
export class UavMission {
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

  @Column({ type: 'text', name: 'mission_code', unique: true })
  missionCode: string;

  @Column({ type: 'text', name: 'mission_name' })
  missionName: string;

  @Column({ type: 'text', name: 'mission_type' })
  missionType: string;

  @Column({ type: 'text', default: 'planned' })
  status: string;

  @Column({ type: 'text', name: 'uav_sn', nullable: true })
  uavSn: string | null;

  @Column({ type: 'text', name: 'pilot_name', nullable: true })
  pilotName: string | null;

  @Column({
    type: 'geometry',
    name: 'flight_path',
    spatialFeatureType: 'MultiLineStringZ',
    srid: 4326,
    nullable: true,
  })
  @Index('idx_uav_mission_flight_path', { spatial: true })
  flightPath: unknown;

  @Column({ type: 'double precision', name: 'altitude_m', nullable: true })
  altitudeM: number | null;

  @Column({ type: 'timestamptz', name: 'started_at', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamptz', name: 'ended_at', nullable: true })
  endedAt: Date | null;

  @Column({ type: 'text', name: 'result_uri', nullable: true })
  resultUri: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  attrs: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
