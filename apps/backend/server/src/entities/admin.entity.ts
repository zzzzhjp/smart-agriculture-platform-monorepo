import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'admin',
  schema: 'crm',
})
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  admin_account: string;

  @Column()
  admin_password: string;
}
