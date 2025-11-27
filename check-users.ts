
import { prisma } from "./lib/prisma";

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log("Total Users:", users.length);
    users.forEach(u => {
        console.log(`- User: ${u.email} | 2FA Enabled: ${u.twoFactorEnabled} | Role: ${u.role}`);
    });
  } catch (e) {
      console.error("Error:", e);
  } finally {
      await prisma.$disconnect();
  }
}

checkUsers();
