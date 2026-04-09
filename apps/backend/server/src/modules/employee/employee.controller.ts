import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeDto } from '../../cto/employee.dto';
import { Employee } from '../../entities/employee.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../permission/decorators/require-permissions.decorator';
import { PermissionGuard } from '../permission/guards/permission.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('crm/employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @RequirePermissions('hr:employee:read')
  @Get('/all')
  findAll(): any {
    return this.employeeService.findAll();
  }

  @RequirePermissions('hr:employee:update')
  @Post('/add')
  addEmployee(@Body() employeeDto: Partial<EmployeeDto>): any {
    return this.employeeService.addEmployee(
      employeeDto.employee_name,
      employeeDto.employee_phone,
      employeeDto.employee_address,
      employeeDto.join_time,
      employeeDto.resign_time,
    );
  }

  @RequirePermissions('hr:employee:update')
  @Post('/update')
  updateEmployee(@Body() employeeDto: Partial<EmployeeDto>): any {
    return this.employeeService.updateEmployee(
      employeeDto.id,
      employeeDto.employee_name,
      employeeDto.employee_phone,
      employeeDto.employee_address,
      employeeDto.join_time,
      employeeDto.resign_time,
    );
  }

  @RequirePermissions('hr:employee:read')
  @Get('/get/:id')
  findOne(@Param('id') id: number): Promise<Employee> {
    return this.employeeService.findOne(id);
  }

  @RequirePermissions('hr:employee:update')
  @Get('/delete/:id')
  deleteEmployee(@Param('id') id: number): any {
    return this.employeeService.deleteEmployee(id);
  }
}

