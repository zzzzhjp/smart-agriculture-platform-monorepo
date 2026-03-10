import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Admin } from '../../entities/admin.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  private async validateAdmin(
    admin_account: string,
    admin_password: string,
  ): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { admin_account },
      relations: ['role'],
    });

    if (!admin || admin.admin_password !== admin_password) {
      throw new UnauthorizedException('�˺Ż��������');
    }

    return admin;
  }

  async login(loginDto: LoginDto) {
    const admin = await this.validateAdmin(
      loginDto.admin_account,
      loginDto.admin_password,
    );

    const payload = {
      sub: admin.id,
      admin_account: admin.admin_account,
      role_id: admin.role?.id,
      role_name: admin.role?.role_name,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      admin: {
        id: admin.id,
        admin_account: admin.admin_account,
        role: admin.role
          ? {
              id: admin.role.id,
              role_name: admin.role.role_name,
              role_enabled: admin.role.role_enabled,
            }
          : null,
      },
    };
  }
}
