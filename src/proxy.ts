import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });

  // If user is not authenticated and trying to access protected routes
  if (!token && request.nextUrl.pathname.startsWith("/presentations")) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // If user is authenticated and trying to access presentations page
  if (token && request.nextUrl.pathname.startsWith("/presentations")) {
    try {
      const response = await fetch(
        `${request.nextUrl.origin}/api/settings?key=show_presentations`,
        {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (!data.value.enabled) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    } catch (error) {
      console.error("Error checking feature status:", error);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/presentations/:path*"],
};
