import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  schema: 'crm',
  name: 'Auth',
})
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;
}
