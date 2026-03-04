import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('crm')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async register() {
    return '注册成功';
  }

  /**
   * 登录
   * @param loginDto 登录Dto
   * @returns 登录结果
   */
  @Post('/login')
  async login() {
    return '已经登录';
  }
}
