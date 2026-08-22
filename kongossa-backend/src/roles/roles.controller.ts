import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Role administration. Every route reads or mutates the authorization model,
 * so each is gated on the matching dynamic permission — the same
 * `action:resource` strings the admin UI gates on.
 */
@ApiTags('Roles')
@ApiBearerAuth('bearer')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Create a new role
   * POST /roles
   */
  @Post()
  @RequirePermissions('create:role')
  async createRole(
    @Body()
    body: {
      name: string;
      description?: string;
      permissions?: number[];
    },
  ) {
    return this.rolesService.createRole(body);
  }

  /**
   * Get all roles
   * GET /roles
   */
  @Get()
  @RequirePermissions('read:role')
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  /**
   * Get role by ID
   * GET /roles/:id
   */
  @Get(':id')
  @RequirePermissions('read:role')
  async getRoleById(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.getRoleById(id);
  }

  /**
   * Update a role
   * PATCH /roles/:id
   */
  @Patch(':id')
  @RequirePermissions('update:role')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateRoleDto,
  ) {
    return this.rolesService.updateRole(id, data);
  }

  /**
   * Delete a role
   * DELETE /roles/:id
   */
  @Delete(':id')
  @RequirePermissions('delete:role')
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.deleteRole(id);
  }

  /**
   * Assign a role to a user
   * POST /roles/assign
   *
   * Privilege-granting path — requires the same permission as editing a role.
   */
  @Post('assign')
  @RequirePermissions('update:role')
  async assignRoleToUser(
    @Body('userId') userId: number,
    @Body('roleId') roleId: number,
  ) {
    return this.rolesService.assignRoleToUser(userId, roleId);
  }

  /**
   * Remove a role from a user
   * POST /roles/remove
   */
  @Post('remove')
  @RequirePermissions('update:role')
  async removeRoleFromUser(
    @Body('userId') userId: number,
    @Body('roleId') roleId: number,
  ) {
    return this.rolesService.removeRoleFromUser(userId, roleId);
  }

  /**
   * Get all roles of a user
   * GET /roles/user/:userId
   */
  @Get('user/:userId')
  @RequirePermissions('read:role')
  async getUserRoles(@Param('userId', ParseIntPipe) userId: number) {
    return this.rolesService.getUserRoles(userId);
  }
}
