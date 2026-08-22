import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PERMISSION_ACTIONS } from './constants/permission-actions';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Permission administration.
 *
 * Reads are gated on `read:role` because these endpoints exist to populate the
 * Roles admin screen, which the frontend gates on `read:role`. There is no
 * `read:permission` row in the database — writes use `create:permission`.
 */
@ApiTags('Permissions')
@ApiBearerAuth('bearer')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('actions')
  @RequirePermissions('read:role')
  getActions() {
    return PERMISSION_ACTIONS;
  }

  @Post()
  @RequirePermissions('create:permission')
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get('with-roles')
  @RequirePermissions('read:role')
  findAllWithRoles() {
    return this.permissionsService.findAllWithRoles();
  }

  @Get()
  @RequirePermissions('read:role')
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('read:role')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('create:permission')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @RequirePermissions('create:permission')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }
}
