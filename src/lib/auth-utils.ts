import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { ADMIN_USERS } from "../contexts/admins";

export async function getAuthenticatedUser() {
  // Force dynamic rendering and ensure proper request context
  // These calls are necessary to ensure each request gets proper isolation
  // Test in prod
  void (await cookies());
  void (await headers());

  // Get the session with proper request context
  const session = await auth();

  if (!session?.user?.email) {
    return {
      error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
      email: null,
    };
  }

  return {
    error: null,
    email: session.user.email,
  };
}

export async function getAuthenticatedAdmin() {
  const { error, email } = await getAuthenticatedUser();

  if (error) {
    return { error, isAdmin: false };
  }

  const isAdmin = ADMIN_USERS.includes(email!);

  if (!isAdmin) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      isAdmin: false,
    };
  }

  return {
    error: null,
    isAdmin: true,
    email,
  };
}
