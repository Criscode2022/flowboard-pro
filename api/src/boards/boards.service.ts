import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class BoardsService {
  constructor(
    private prisma: PrismaService,
    private workspaces: WorkspacesService,
  ) {}

  async findByWorkspace(workspaceId: string, userId: string) {
    await this.workspaces.ensureMember(workspaceId, userId);
    return this.prisma.board.findMany({
      where: { workspaceId, isArchived: false },
      include: { _count: { select: { columns: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        workspace: true,
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              include: {
                assignee: { select: { id: true, name: true, avatarUrl: true } },
                creator: { select: { id: true, name: true } },
                labels: { include: { label: true } },
                _count: { select: { comments: true } },
              },
            },
          },
        },
      },
    });
    if (!board) throw new NotFoundException('Board not found');
    await this.workspaces.ensureMember(board.workspaceId, userId);
    return board;
  }

  async create(
    userId: string,
    data: { workspaceId: string; title: string; description?: string; color?: string },
  ) {
    await this.workspaces.ensureMember(data.workspaceId, userId);
    return this.prisma.board.create({
      data: {
        title: data.title,
        description: data.description,
        color: data.color || '#6366f1',
        workspaceId: data.workspaceId,
        columns: {
          create: [
            { title: 'To Do', position: 0, color: '#94a3b8' },
            { title: 'In Progress', position: 1, color: '#3b82f6' },
            { title: 'Review', position: 2, color: '#f59e0b' },
            { title: 'Done', position: 3, color: '#22c55e' },
          ],
        },
      },
      include: { columns: { orderBy: { position: 'asc' } } },
    });
  }

  async update(id: string, userId: string, data: { title?: string; description?: string; color?: string }) {
    const board = await this.findOne(id, userId);
    return this.prisma.board.update({ where: { id: board.id }, data });
  }

  async archive(id: string, userId: string) {
    const board = await this.findOne(id, userId);
    return this.prisma.board.update({ where: { id: board.id }, data: { isArchived: true } });
  }
}
