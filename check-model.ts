
import { prisma } from "./lib/prisma";

async function checkTwoFactorModel() {
  try {
    // @ts-ignore
    if (prisma.twoFactor) {
        console.log("Prisma TwoFactor model exists on client instance.");
        // @ts-ignore
        const count = await prisma.twoFactor.count();
        console.log("TwoFactor count:", count);
    } else {
        console.log("Prisma TwoFactor model MISSING on client instance.");
        console.log("Keys:", Object.keys(prisma));
    }
  } catch (e) {
      console.error("Error:", e);
  } finally {
      await prisma.$disconnect();
  }
}

checkTwoFactorModel();
