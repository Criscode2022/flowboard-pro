import { Body, Controller, Get, Param, Post, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CardsService } from './cards.service';
import { IsString, MinLength, IsOptional, IsEnum, IsBoolean, IsNumber, IsDateString } from 'class-validator';
import { Priority } from '@prisma/client';

class CreateCardDto {
  @ApiProperty() @IsString() columnId: string;
  @ApiProperty() @IsString() @MinLength(1) title: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: Priority, required: false }) @IsOptional() @IsEnum(Priority) priority?: Priority;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() dueDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() assigneeId?: string;
}

class UpdateCardDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() title?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: Priority, required: false }) @IsOptional() @IsEnum(Priority) priority?: Priority;
  @ApiProperty({ required: false }) @IsOptional() dueDate?: string | null;
  @ApiProperty({ required: false }) @IsOptional() assigneeId?: string | null;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isCompleted?: boolean;
}

class MoveCardDto {
  @ApiProperty() @IsString() columnId: string;
  @ApiProperty() @IsNumber() position: number;
}

class CommentDto {
  @ApiProperty() @IsString() @MinLength(1) content: string;
}

@ApiTags('cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private cards: CardsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateCardDto) {
    return this.cards.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateCardDto) {
    return this.cards.update(id, req.user.id, dto);
  }

  @Post(':id/move')
  move(@Param('id') id: string, @Request() req: any, @Body() dto: MoveCardDto) {
    return this.cards.move(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.cards.remove(id, req.user.id);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string, @Request() req: any) {
    return this.cards.getComments(id, req.user.id);
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Request() req: any, @Body() dto: CommentDto) {
    return this.cards.addComment(id, req.user.id, dto.content);
  }
}
