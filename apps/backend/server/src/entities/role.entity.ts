import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Role')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  role_name: string;

  @Column()
  role_enabled: boolean;
}
