import { Admin } from './admin.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  schema: 'crm',
  name: 'Role',
})
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  role_name: string;

  @Column()
  role_enabled: boolean;

  @OneToMany(() => Admin, (admin) => admin.role)
  admins: Admin[];
}
