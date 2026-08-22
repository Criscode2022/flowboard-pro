import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { Priority } from '@prisma/client';

@Injectable()
export class CardsService {
  constructor(
    private prisma: PrismaService,
    private workspaces: WorkspacesService,
  ) {}

  private async getBoardWorkspaceId(columnId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: { board: true },
    });
    if (!column) throw new NotFoundException('Column not found');
    return column.board.workspaceId;
  }

  async create(
    userId: string,
    data: {
      columnId: string;
      title: string;
      description?: string;
      priority?: Priority;
      dueDate?: string;
      assigneeId?: string;
    },
  ) {
    const workspaceId = await this.getBoardWorkspaceId(data.columnId);
    await this.workspaces.ensureMember(workspaceId, userId);
    const maxPos = await this.prisma.card.aggregate({
      where: { columnId: data.columnId },
      _max: { position: true },
    });
    return this.prisma.card.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assigneeId: data.assigneeId,
        creatorId: userId,
        columnId: data.columnId,
        position: (maxPos._max.position ?? -1) + 1,
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        creator: { select: { id: true, name: true } },
        labels: { include: { label: true } },
      },
    });
  }

  async update(
    id: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      priority?: Priority;
      dueDate?: string | null;
      assigneeId?: string | null;
      isCompleted?: boolean;
    },
  ) {
    const card = await this.prisma.card.findUnique({
      where: { id },
      include: { column: { include: { board: true } } },
    });
    if (!card) throw new NotFoundException('Card not found');
    await this.workspaces.ensureMember(card.column.board.workspaceId, userId);
    return this.prisma.card.update({
      where: { id },
      data: {
        ...data,
        dueDate:
          data.dueDate === null ? null : data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        creator: { select: { id: true, name: true } },
        labels: { include: { label: true } },
      },
    });
  }

  async move(id: string, userId: string, data: { columnId: string; position: number }) {
    const card = await this.prisma.card.findUnique({
      where: { id },
      include: { column: { include: { board: true } } },
    });
    if (!card) throw new NotFoundException('Card not found');
    await this.workspaces.ensureMember(card.column.board.workspaceId, userId);
    return this.prisma.card.update({
      where: { id },
      data: { columnId: data.columnId, position: data.position },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        creator: { select: { id: true, name: true } },
        labels: { include: { label: true } },
      },
    });
  }

  async remove(id: string, userId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
      include: { column: { include: { board: true } } },
    });
    if (!card) throw new NotFoundException('Card not found');
    await this.workspaces.ensureMember(card.column.board.workspaceId, userId);
    await this.prisma.card.delete({ where: { id } });
    return { deleted: true };
  }

  async addComment(cardId: string, userId: string, content: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { column: { include: { board: true } } },
    });
    if (!card) throw new NotFoundException('Card not found');
    await this.workspaces.ensureMember(card.column.board.workspaceId, userId);
    return this.prisma.comment.create({
      data: { content, cardId, authorId: userId },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async getComments(cardId: string, userId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { column: { include: { board: true } } },
    });
    if (!card) throw new NotFoundException('Card not found');
    await this.workspaces.ensureMember(card.column.board.workspaceId, userId);
    return this.prisma.comment.findMany({
      where: { cardId },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}
