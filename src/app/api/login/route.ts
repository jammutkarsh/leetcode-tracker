import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";

// Setup fast lookup for valid instance keys
const instanceSecretStr = process.env.INSTANCE_SECRET || "";
const VALID_KEYS = new Set(instanceSecretStr.split(":::::").filter(Boolean));

export async function POST(req: Request) {
  try {
    const instanceKey = req.headers.get("x-instance-key");

    // Fail Fast: Validate instance key
    if (!instanceKey || !VALID_KEYS.has(instanceKey)) {
      return NextResponse.json(
        { error: "Unauthorized instance" },
        { status: 401 },
      );
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 },
      );
    }

    // Example DB Query (boilerplate)
    const user = await db
      .selectFrom("users")
      .selectAll()
      .where("username", "=", username)
      .executeTakeFirst();

    // Boilerplate password verification
    if (!user || user.password_hash !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Success: Generate JWT
    const token = await signToken(user.username);

    const response = NextResponse.json({ success: true });

    // Set httpOnly cookie with JWT
    response.cookies.set({
      name: "session_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
