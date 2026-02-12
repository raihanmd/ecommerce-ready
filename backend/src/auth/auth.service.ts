import * as bcrypt from 'bcrypt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthLoginPayload } from './zod';
import { PrismaService } from 'src/_common/prisma/prisma.service';
import { ReqWithUser } from 'src/types';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    data: AuthLoginPayload,
  ): Promise<{ token: string; user: ReqWithUser['user'] }> {
    const user = await this.prismaService.user.findFirst({
      where: {
        username: data.username,
      },
      select: {
        id: true,
        username: true,
        password: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException('Username or password wrong');

    const isMatch = await bcrypt.compare(
      data.password as string,
      user.password,
    );

    if (!isMatch) throw new UnauthorizedException('Username or password wrong');

    this.logger.log(`Login User: ${user.username}`);

    return {
      token: this.jwtService.sign({
        user: {
          id: user.id,
        },
        role: user.role,
      }),
      user: {
        id: user.id,
        role: user.role!,
      },
    };
  }

  async me(userId: string) {
    return await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      omit: {
        created_at: true,
        updated_at: true,
        password: true,
      },
      include: {
        role: true,
      },
    });
  }
}
