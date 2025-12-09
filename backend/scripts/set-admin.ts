import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function setAdminUser() {
  const adminEmail = 'mongchanrattnak@gmail.com';

  try {
    console.log(`🔍 Looking for user: ${adminEmail}...`);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!user) {
      console.error(`❌ User not found with email: ${adminEmail}`);
      console.log('\n💡 Please sign in to the app first to create your user record.');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`   Current role: ${user.role}`);

    if (user.role === UserRole.ADMIN) {
      console.log('✅ User is already an admin!');
      process.exit(0);
    }

    // Update to ADMIN
    console.log('\n🔄 Updating role to ADMIN...');
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: UserRole.ADMIN },
    });

    console.log('✅ Successfully updated!');
    console.log(`   New role: ${updatedUser.role}`);
    console.log('\n🎉 You are now an admin! Reload the app to see the Admin Dashboard.');
  } catch (error) {
    console.error('❌ Error updating user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminUser();
