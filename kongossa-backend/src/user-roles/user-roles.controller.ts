import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

/**
 * User↔Role assignment — admin-only. Unguarded, this is a direct
 * privilege-escalation path: anyone could grant themselves the admin role.
 */
@ApiTags('User Roles')
@ApiBearerAuth('bearer')
@Controller('user-roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('update:role')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  create(@Body() createUserRoleDto: CreateUserRoleDto) {
    return this.userRolesService.create(createUserRoleDto);
  }

  @Get()
  findAll() {
    return this.userRolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userRolesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserRoleDto: UpdateUserRoleDto) {
    return this.userRolesService.update(+id, updateUserRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userRolesService.remove(+id);
  }
}
