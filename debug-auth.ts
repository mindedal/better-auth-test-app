
import { auth } from "./lib/auth";

async function debugAuth() {
  const email = "test-debug@example.com";
  const password = "password123";
  const name = "Debug User";

  console.log("--- Starting Debug Auth ---");

  // 1. Cleanup existing test user
  // We can't easily delete via auth api, but we can try to sign up and ignore "already exists" or just use a random email.
  const randomEmail = `debug-${Date.now()}@example.com`;
  console.log(`Using email: ${randomEmail}`);

  try {
    // 2. Sign Up
    console.log("Attempting Sign Up...");
    const signUpRes = await auth.api.signUpEmail({
      body: {
        email: randomEmail,
        password,
        name,
      }
    });
    console.log("Sign Up Result:", signUpRes);

    // 3. Sign In
    console.log("Attempting Sign In...");
    const signInRes = await auth.api.signInEmail({
      body: {
        email: randomEmail,
        password,
      }
    });
    console.log("Sign In Result:", JSON.stringify(signInRes, null, 2));

  } catch (e) {
    console.error("Error during debug auth:", e);
  }
}

debugAuth();
