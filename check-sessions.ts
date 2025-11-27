
import { prisma } from "./lib/prisma";

async function checkSessions() {
  try {
    const sessions = await prisma.session.findMany({
        include: { user: true }
    });
    console.log("Total Sessions in DB:", sessions.length);
    sessions.forEach(s => {
        console.log(`- Session Token: ${s.token.substring(0, 10)}... | User: ${s.user.email} | Expires: ${s.expiresAt}`);
    });
  } catch (e) {
      console.error("Error querying DB:", e);
  } finally {
      await prisma.$disconnect();
  }
}

checkSessions();
