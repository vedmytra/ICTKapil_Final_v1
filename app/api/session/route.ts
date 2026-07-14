import { NextResponse, type NextRequest } from "next/server";

// Lightweight session cookie so middleware can gate routes at the edge without
// a full round-trip to Firebase Auth. The client calls POST after sign-in with
// the Firebase ID token, and DELETE on sign-out.
export async function POST(request: NextRequest) {
  const { idToken } = await request.json();
  if (!idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("__session", idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("__session");
  return response;
}
