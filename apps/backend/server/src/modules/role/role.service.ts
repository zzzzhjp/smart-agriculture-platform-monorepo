import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async findOne(id: number): Promise<Role> {
    return this.roleRepository.findOne({ where: { id } });
  }

  async create(role_name: string, role_enabled: boolean = true): Promise<Role> {
    return this.roleRepository.save({
      role_name,
      role_enabled,
    });
  }

  async update(
    id: number,
    role_name?: string,
    role_enabled?: boolean,
  ): Promise<Role> {
    await this.roleRepository.update(id, {
      role_name,
      role_enabled,
    });
    return this.findOne(id);
  }
}
