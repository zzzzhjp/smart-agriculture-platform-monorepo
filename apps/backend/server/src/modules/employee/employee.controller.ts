import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeDto } from '../../cto/employee.dto';
import { Employee } from '../../entities/employee.entity';

@Controller('crm/employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('/all')
  findAll(): any {
    return this.employeeService.findAll();
  }

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

  @Get('/get/:id')
  findOne(@Param('id') id: number): Promise<Employee> {
    return this.employeeService.findOne(id);
  }

  @Get('/delete/:id')
  deleteEmployee(@Param('id') id: number): any {
    return this.employeeService.deleteEmployee(id);
  }
}
