import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Organization } from './organization.entity';

@Entity({
  schema: 'crm',
  name: 'farm',
})
@Index('idx_farm_organization_id', ['organizationId'])
export class Farm {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'organization_id', nullable: true })
  organizationId: string | null;

  @Column({ type: 'text', name: 'farm_code', unique: true })
  farmCode: string;

  @Column({ type: 'text', name: 'farm_name' })
  farmName: string;

  @Column({ type: 'integer', name: 'manager_employee_id', nullable: true })
  managerEmployeeId: number | null;

  @ManyToOne(() => Organization, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  organization: Organization | null;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'manager_employee_id', referencedColumnName: 'id' })
  managerEmployee: Employee | null;

  @Column({ type: 'text', default: 'active' })
  status: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
    nullable: true,
  })
  @Index('idx_farm_geom', { spatial: true })
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
  @Index('idx_farm_bbox', { spatial: true })
  bbox: unknown;

  @Column({ type: 'double precision', name: 'area_m2', nullable: true })
  areaM2: number | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  attrs: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
