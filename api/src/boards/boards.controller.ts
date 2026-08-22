import { Body, Controller, Get, Param, Post, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BoardsService } from './boards.service';
import { IsString, MinLength, IsOptional } from 'class-validator';

class CreateBoardDto {
  @ApiProperty() @IsString() workspaceId: string;
  @ApiProperty() @IsString() @MinLength(1) title: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() color?: string;
}

class UpdateBoardDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() title?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() color?: string;
}

@ApiTags('boards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private boards: BoardsService) {}

  @Get('workspace/:workspaceId')
  findByWorkspace(@Param('workspaceId') workspaceId: string, @Request() req: any) {
    return this.boards.findByWorkspace(workspaceId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.boards.findOne(id, req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateBoardDto) {
    return this.boards.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateBoardDto) {
    return this.boards.update(id, req.user.id, dto);
  }

  @Delete(':id')
  archive(@Param('id') id: string, @Request() req: any) {
    return this.boards.archive(id, req.user.id);
  }
}
