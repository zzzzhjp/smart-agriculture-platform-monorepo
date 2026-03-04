import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  schema: 'crm',
  name: 'Employee',
})
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employee_name: string;

  @Column()
  employee_phone: string;

  @Column()
  employee_address: string;

  @Column()
  join_time?: string;

  @Column()
  resign_time?: string;
}
