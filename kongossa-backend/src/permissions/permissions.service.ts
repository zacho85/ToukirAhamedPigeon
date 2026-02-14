import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

// permissions.service.ts
async create(data: CreatePermissionDto) {
  const createdPermissions: Permission[] = []; // type fixed here
  for (const act of data.actions) {
    const name = `${act}:${data.resource}`;

    const exists = await this.prisma.permission.findFirst({ where: { name } });
    if (exists) {
      throw new BadRequestException(`Permission "${name}" already exists`);
    }

    const permission = await this.prisma.permission.create({
      data: {
        action: act,
        resource: data.resource,
        name,
        description: data.description,
        rolePermissions: {
          create: data.roles.map((roleId) => ({ role: { connect: { id: roleId } } })),
        },
      },
    });

    createdPermissions.push(permission);
  }

  return createdPermissions;
}


async findAllWithRoles() {
  const perms = await this.prisma.permission.findMany({
    include: {
      rolePermissions: { include: { role: true } },
    },
  });

  return perms.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    roles: p.rolePermissions.map((rp) => rp.role),
  }));
}


  async findAll() {
    return this.prisma.permission.findMany();
  }

  async findOne(id: number) {
    return this.prisma.permission.findUnique({ where: { id } });
  }

 async update(id: number, data: UpdatePermissionDto) {
    const { roles, ...permissionData } = data;

    const exists = await this.prisma.permission.findFirst({
      where: {
        action: data.action,
        resource: data.resource,
        NOT: { id },
      },
    });

    if (exists) {
      throw new BadRequestException('Permission already exists');
    }

    return this.prisma.permission.update({
      where: { id },
      data: {
        ...permissionData,

        // ✅ correct relation update (join table)
        ...(roles && {
          rolePermissions: {
            deleteMany: {}, // remove old roles
            createMany: {
              data: roles.map((roleId) => ({
                roleId,
              })),
            },
          },
        }),
      },
      include: {
        rolePermissions: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const count = await this.prisma.rolePermission.count({
      where: { permissionId: id },
    });

    if (count > 0) {
      throw new BadRequestException(
        'Permission cannot be deleted because it is assigned to roles'
      );
    }

    return this.prisma.permission.delete({ where: { id } });
  }
}
