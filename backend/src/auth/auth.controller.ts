import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';

import { type AuthLoginPayload, UsersValidation } from './zod';
import { type ReqWithUser } from 'src/types';
import { AuthService } from './auth.service';
import { ResponseService } from 'src/_common/response/response.service';
import { ZodValidationPipeFactory } from 'src/_common/pipes/zod-validation-validation-pipe';
import { Public } from 'src/_common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
  ) {}

  @HttpCode(200)
  @Public()
  @Post('login')
  async login(
    @Body(ZodValidationPipeFactory(UsersValidation.LOGIN))
    loginReq: AuthLoginPayload,
  ) {
    const data = await this.authService.login(loginReq);

    return this.responseService.success(data);
  }

  @HttpCode(200)
  @Get('me')
  async me(@Req() { user }: ReqWithUser) {
    const data = await this.authService.me(user.id);

    return this.responseService.success(data);
  }
}
