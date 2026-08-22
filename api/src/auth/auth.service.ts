import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
      },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });

    const slug = `personal-${user.id.slice(-8)}`;
    await this.prisma.workspace.create({
      data: {
        name: `${user.name}'s Workspace`,
        slug,
        description: 'Your personal workspace',
        members: { create: { userId: user.id, role: 'OWNER' } },
        boards: {
          create: {
            title: 'Getting Started',
            description: 'Welcome board',
            color: '#6366f1',
            columns: {
              create: [
                { title: 'To Do', position: 0, color: '#94a3b8' },
                { title: 'In Progress', position: 1, color: '#3b82f6' },
                { title: 'Done', position: 2, color: '#22c55e' },
              ],
            },
          },
        },
      },
    });

    return { accessToken: this.signToken(user.id, user.email), user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return {
      accessToken: this.signToken(user.id, user.email),
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
    };
  }

  private signToken(userId: string, email: string) {
    return this.jwt.sign({ sub: userId, email });
  }
}
