const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@example.com';
  const password = '123456';
  const name = 'Admin QNU';
  const phone = '0909999999';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('❗️Tài khoản admin đã tồn tại');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone,
      role: 'ADMIN' // ✅ gán quyền ADMIN
    }
  });

  console.log('✅ Admin account created:', user);
}

createAdmin().catch((err) => {
  console.error('❌ Lỗi:', err);
}).finally(() => {
  prisma.$disconnect();
});
