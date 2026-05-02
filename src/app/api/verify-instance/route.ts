import { NextResponse } from "next/server";

const instanceSecretStr = process.env.INSTANCE_SECRET || "";
const VALID_KEYS = new Set(instanceSecretStr.split(":::::").filter(Boolean));

export async function POST(req: Request) {
  try {
    const instanceKey = req.headers.get("x-instance-key");

    if (!instanceKey || !VALID_KEYS.has(instanceKey)) {
      return NextResponse.json(
        { error: "Unauthorized instance" },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
