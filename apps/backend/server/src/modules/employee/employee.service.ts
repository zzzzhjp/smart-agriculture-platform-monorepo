import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../entities/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find();
  }

  async addEmployee(
    name: string,
    phone: string,
    address: string,
    join_time: string = new Date().toISOString(),
    resign_time: string = '0',
  ): Promise<Employee> {
    return this.employeeRepository.save({
      employee_name: name,
      employee_phone: phone,
      employee_address: address,
      join_time: join_time || new Date().toISOString(),
      resign_time: resign_time || null,
    });
  }

  async updateEmployee(
    id: number,
    name?: string,
    phone?: string,
    address?: string,
    join_time?: string,
    resign_time?: string,
  ): Promise<Employee> {
    await this.employeeRepository.update(id, {
      employee_name: name,
      employee_phone: phone,
      employee_address: address,
      join_time: join_time || null,
      resign_time: resign_time || null,
    });
    return this.findOne(id);
  }

  async findOne(id: number): Promise<Employee> {
    return this.employeeRepository.findOne({ where: { id } });
  }

  async deleteEmployee(id: number): Promise<Employee> {
    const employee = await this.findOne(id);
    await this.employeeRepository.delete(id);
    return employee;
  }
}
