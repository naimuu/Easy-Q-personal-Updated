import { SignJWT, jwtVerify } from "jose";
const secretKey = process.env.SECRET || "cluster0";
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(
  id: string,
  isAdmin: boolean,
  updateAt: Date,
  exp: number,
) {
  return new SignJWT({ userId: id, isAdmin: isAdmin, updateAt: updateAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${exp}d`)
    .sign(encodedKey);
}

export async function mailVerficationToken(
  email: string,
  code: string,
  name: string,
  hash: string,
) {
  return new SignJWT({ email, code, name, hash })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(encodedKey);
}

export async function verifyMailVerficationToken(token: string) {
  const { payload } = await jwtVerify(token, encodedKey, {
    algorithms: ["HS256"],
  });
  return payload as { email: string; code: string; name: string; hash: string };
}

export async function decrypt(session: string | undefined = "") {
  const { payload } = await jwtVerify(session, encodedKey, {
    algorithms: ["HS256"],
  });
  return payload;
}

export const isSessionExpired = async (
  passwordChangedAt: Date,
  jwtIssuedAt: number,
) => {
  const passChangeTime = passwordChangedAt
    ? new Date(passwordChangedAt).getTime() / 1000
    : 0;
  return passChangeTime > jwtIssuedAt;
};
