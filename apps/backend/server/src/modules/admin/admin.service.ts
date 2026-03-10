import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '../../entities/admin.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async findAll(): Promise<Admin[]> {
    return this.adminRepository.find();
  }

  async findOne(id: number): Promise<Admin> {
    return this.adminRepository.findOne({ where: { id } });
  }

  async create(admin_account: string, admin_password: string): Promise<Admin> {
    return this.adminRepository.save({
      admin_account,
      admin_password,
    });
  }

  async updatePassword(id: number, admin_password: string): Promise<Admin> {
    await this.adminRepository.update(id, {
      admin_password,
    });
    return this.findOne(id);
  }
}
