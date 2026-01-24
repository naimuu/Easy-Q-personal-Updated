import axios from "axios";

const SMS_API_KEY = process.env.SMS_API_KEY || "";
const SMS_API_URL = "https://api.sms.net.bd/sendsms";

interface SMSResponse {
  error: number;
  msg: string;
  data?: {
    request_id: number;
  };
}

/**
 * Send SMS using sms.net.bd API
 * @param phone - Phone number in Bangladesh format (01XXXXXXXXX or 8801XXXXXXXXX)
 * @param message - SMS message content
 * @returns Promise with API response
 */
export async function sendSMS(
  phone: string,
  message: string,
): Promise<SMSResponse> {
  try {
    // Normalize phone number to 880 format
    let normalizedPhone = phone.trim();

    // Remove any spaces or special characters
    normalizedPhone = normalizedPhone.replace(/[\s\-\(\)]/g, "");

    // Add country code if not present
    if (normalizedPhone.startsWith("01")) {
      normalizedPhone = "880" + normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith("880")) {
      throw new Error(
        "Invalid phone number format. Use 01XXXXXXXXX or 8801XXXXXXXXX",
      );
    }

    // Validate phone number length (should be 13 digits with 880)
    if (normalizedPhone.length !== 13) {
      throw new Error("Invalid phone number length");
    }

    const response = await axios.post(SMS_API_URL, null, {
      params: {
        api_key: SMS_API_KEY,
        msg: message,
        to: normalizedPhone,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("SMS sending error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.msg || "Failed to send SMS");
  }
}

/**
 * Send OTP via SMS
 * @param phone - Phone number
 * @param otp - OTP code
 * @returns Promise with API response
 */
export async function sendOTPSMS(
  phone: string,
  otp: string,
): Promise<SMSResponse> {
  const message = `আপনার Easy-Q যাচাইকরণ কোড: ${otp}। এই কোডটি ৫ মিনিটের জন্য বৈধ। কাউকে শেয়ার করবেন না।`;
  return sendSMS(phone, message);
}

/**
 * Send welcome SMS after successful registration
 * @param phone - Phone number
 * @param name - User name
 * @returns Promise with API response
 */
export async function sendWelcomeSMS(
  phone: string,
  name: string,
): Promise<SMSResponse> {
  const message = `স্বাগতম ${name}! Easy-Q তে আপনার একাউন্ট সফলভাবে তৈরি হয়েছে। শুভকামনা!`;
  return sendSMS(phone, message);
}

/**
 * Send password reset OTP via SMS
 * @param phone - Phone number
 * @param otp - OTP code
 * @returns Promise with API response
 */
export async function sendPasswordResetOTPSMS(
  phone: string,
  otp: string,
): Promise<SMSResponse> {
  const message = `Easy-Q পাসওয়ার্ড রিসেট কোড: ${otp}। এই কোডটি ৫ মিনিটের জন্য বৈধ। কাউকে শেয়ার করবেন না।`;
  return sendSMS(phone, message);
}

/**
 * Check SMS API balance
 * @returns Promise with balance information
 */
export async function checkSMSBalance(): Promise<{ balance: string }> {
  try {
    const response = await axios.get("https://api.sms.net.bd/user/balance/", {
      params: {
        api_key: SMS_API_KEY,
      },
    });

    if (response.data.error === 0) {
      return response.data.data;
    }
    throw new Error(response.data.msg || "Failed to check balance");
  } catch (error: any) {
    console.error(
      "SMS balance check error:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to check SMS balance");
  }
}
