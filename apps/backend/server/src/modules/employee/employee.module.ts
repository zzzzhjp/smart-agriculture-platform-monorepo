import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../../entities/employee.entity';
import { PermissionModule } from '../permission/permission.module';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), PermissionModule],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}

