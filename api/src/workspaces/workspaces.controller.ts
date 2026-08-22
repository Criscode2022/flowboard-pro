import { Body, Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspacesService } from './workspaces.service';
import { IsString, MinLength, IsOptional } from 'class-validator';

class CreateWorkspaceDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

@ApiTags('workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private workspaces: WorkspacesService) {}

  @Get()
  @ApiOperation({ summary: 'List my workspaces' })
  findAll(@Request() req: any) {
    return this.workspaces.findAllForUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace details' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.workspaces.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create workspace' })
  create(@Request() req: any, @Body() dto: CreateWorkspaceDto) {
    return this.workspaces.create(req.user.id, dto);
  }
}
