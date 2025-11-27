
import { prisma } from "./lib/prisma";

async function disable2FA() {
  try {
    const user = await prisma.user.findFirst();
    if (user) {
        await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorEnabled: false }
        });
        console.log(`Disabled 2FA for user: ${user.email}`);
    } else {
        console.log("No user found");
    }
  } catch (e) {
      console.error("Error:", e);
  } finally {
      await prisma.$disconnect();
  }
}

disable2FA();
