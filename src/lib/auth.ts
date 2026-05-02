import { SignJWT, jwtVerify } from "jose";

export const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_me_in_production";
const key = new TextEncoder().encode(JWT_SECRET);

export async function signToken(username: string) {
  return await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch {
    return null;
  }
}
