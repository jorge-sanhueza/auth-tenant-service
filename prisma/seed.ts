import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1. Create default tenant
  console.log('\n📝 Creating default tenant...');
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Tenant',
      slug: 'default',
      isActive: true,
      config: {
        theme: 'light',
        language: 'en',
      },
    },
  });
  console.log(`✅ Tenant created: ${tenant.name} (ID: ${tenant.id})`);

  // 2. Create default permissions
  console.log('\n🔐 Creating permissions...');
  const permissions = [
    { name: 'user:create', description: 'Create new users' },
    { name: 'user:read', description: 'View user information' },
    { name: 'user:update', description: 'Update user information' },
    { name: 'user:delete', description: 'Delete users' },
    { name: 'role:create', description: 'Create new roles' },
    { name: 'role:read', description: 'View role information' },
    { name: 'role:update', description: 'Update role information' },
    { name: 'role:delete', description: 'Delete roles' },
    { name: 'permission:assign', description: 'Assign permissions to roles' },
  ];

  const createdPermissions = [];
  for (const perm of permissions) {
    const created = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    createdPermissions.push(created);
    console.log(`  ✅ Created permission: ${perm.name}`);
  }

  // 3. Create admin role
  console.log('\n👑 Creating admin role...');
  const adminRole = await prisma.role.upsert({
    where: { name_tenantId: { name: 'admin', tenantId: tenant.id } },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full access',
      isSystem: true,
      tenantId: tenant.id,
    },
  });
  console.log(`✅ Admin role created`);

  // 4. Assign all permissions to admin role
  console.log('\n🔗 Assigning permissions to admin role...');
  for (const permission of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log(
    `✅ Assigned ${createdPermissions.length} permissions to admin role`,
  );

  // 5. Create admin user
  console.log('\n👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin123!@#', 10);
  const adminUser = await prisma.user.upsert({
    where: {
      email_tenantId: { email: 'admin@example.com', tenantId: tenant.id },
    },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      tenantId: tenant.id,
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email}`);

  // 6. Assign admin role to admin user
  console.log('\n🔗 Assigning admin role to admin user...');
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });
  console.log(`✅ Admin role assigned to admin user`);

  // 7. Create test users
  console.log('\n🧪 Creating test users...');
  const testUsers = [
    {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
    },
    {
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'user',
    },
    {
      email: 'bob.wilson@example.com',
      firstName: 'Bob',
      lastName: 'Wilson',
      role: 'user',
    },
  ];

  // Create user role if it doesn't exist
  const userRole = await prisma.role.upsert({
    where: { name_tenantId: { name: 'user', tenantId: tenant.id } },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user with basic permissions',
      isSystem: true,
      tenantId: tenant.id,
    },
  });

  // Assign basic permissions to user role
  const basicPermissions = permissions.filter(
    (p) => p.name === 'user:read' || p.name === 'user:update',
  );

  for (const permission of basicPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: (await prisma.permission.findUnique({
            where: { name: permission.name },
          }))!.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: (await prisma.permission.findUnique({
          where: { name: permission.name },
        }))!.id,
      },
    });
  }

  // Create test users
  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash('Test123!@#', 10);
    const user = await prisma.user.upsert({
      where: { email_tenantId: { email: userData.email, tenantId: tenant.id } },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isActive: true,
        tenantId: tenant.id,
      },
    });

    // Assign user role
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: userRole.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: userRole.id,
      },
    });
    console.log(`  ✅ Created test user: ${userData.email}`);
  }

  // 8. Create additional tenant for testing multi-tenancy
  console.log('\n🏢 Creating additional tenant for testing...');
  const secondTenant = await prisma.tenant.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      isActive: true,
      config: {
        theme: 'dark',
        language: 'en',
      },
    },
  });
  console.log(
    `✅ Second tenant created: ${secondTenant.name} (ID: ${secondTenant.id})`,
  );

  // Create a user for second tenant
  const secondTenantPassword = await bcrypt.hash('Test123!@#', 10);
  const secondTenantUser = await prisma.user.upsert({
    where: {
      email_tenantId: { email: 'contact@acme.com', tenantId: secondTenant.id },
    },
    update: {},
    create: {
      email: 'contact@acme.com',
      password: secondTenantPassword,
      firstName: 'Acme',
      lastName: 'Contact',
      isActive: true,
      tenantId: secondTenant.id,
    },
  });
  console.log(`  ✅ Created user for second tenant: ${secondTenantUser.email}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   • 1 default tenant (ID: ${tenant.id})`);
  console.log(`   • 1 additional tenant (ID: ${secondTenant.id})`);
  console.log(`   • ${permissions.length} permissions`);
  console.log(`   • 2 roles (admin, user)`);
  console.log(`   • 1 admin user`);
  console.log(`   • ${testUsers.length} test users`);
  console.log(`   • 1 user for second tenant`);
  console.log('\n🔑 Test Credentials:');
  console.log(`   Tenant ID: ${tenant.id}`);
  console.log(`   Admin: admin@example.com / Admin123!@#`);
  console.log(`   Test Users: john.doe@example.com / Test123!@#`);
  console.log(`               jane.smith@example.com / Test123!@#`);
  console.log(`               bob.wilson@example.com / Test123!@#`);
  console.log(
    `   Second Tenant: contact@acme.com / Test123!@# (Tenant ID: ${secondTenant.id})`,
  );
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
