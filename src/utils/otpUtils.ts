import prisma from "@/config/prisma";

export async function generateOtp() {
  const digits = "0123456789";

  let otp: string;
  let isUnique = false;

  while (!isUnique) {
    otp = "";
    for (let i = 0; i < 6; i++) {
      otp += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    // Check if OTP already exists in the database
    const existingOtp = await prisma.otpMail.findUnique({
      where: { otp },
    });

    if (!existingOtp) {
      isUnique = true;
    }
  }

  return otp!;
}

// export const createOtpTokenPhone = (payload: { phone: string, code: string }, secret: string, expiresIn: number | string) => jwt.sign(payload, secret, { expiresIn })

// export const createSignUptoken = (payload: { phone: string, email: string }, secret: string, expiresIn: string) => jwt.sign(payload, secret, { expiresIn })