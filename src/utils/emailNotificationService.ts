import prisma from "@/config/prisma";
import { sendMail } from "./mailer";
import { sendSMS } from "./smsService";

export interface EmailNotificationData {
  type: "purchase" | "confirmation" | "expiration_warning";
  title: string;
  message: string;
  data?: any;
  emailTo: string;
}

export interface SMSNotificationData {
  type: "purchase" | "confirmation" | "expiration_warning";
  title: string;
  message: string;
  data?: any;
  phoneTo: string;
}

/**
 * Sends an email notification
 */
export const sendEmailNotification = async ({
  type,
  title,
  message,
  data,
  emailTo,
}: EmailNotificationData) => {
  try {
    await sendMail(
      emailTo,
      title,
      getEmailTemplate(type, title, message, data),
    );

    console.log(`Email notification sent to ${emailTo}: ${title}`);
  } catch (error) {
    console.error("Failed to send email notification:", error);
    throw error;
  }
};

/**
 * Sends an SMS notification
 */
export const sendSMSNotification = async ({
  type,
  title,
  message,
  data,
  phoneTo,
}: SMSNotificationData) => {
  try {
    const smsMessage = `${title}\n${message}${getSMSDataContent(type, data)}`;
    await sendSMS(phoneTo, smsMessage);

    console.log(`SMS notification sent to ${phoneTo}: ${title}`);
  } catch (error) {
    console.error("Failed to send SMS notification:", error);
    throw error;
  }
};

/**
 * Get email template based on notification type
 */
const getEmailTemplate = (
  type: string,
  title: string,
  message: string,
  data?: any,
) => {
  const baseTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                background: #ffffff;
                max-width: 600px;
                margin: auto;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #5750F1;
                margin-bottom: 10px;
            }
            .title {
                color: #333;
                font-size: 20px;
                margin-bottom: 20px;
            }
            .message {
                color: #666;
                line-height: 1.6;
                margin-bottom: 20px;
            }
            .data-section {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                color: #888;
                font-size: 12px;
            }
            .button {
                display: inline-block;
                background-color: #5750F1;
                color: white !important;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 5px;
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">📚 Easy-Q</div>
            </div>
            <h2 class="title">${title}</h2>
            <div class="message">${message}</div>
            ${getTypeSpecificContent(type, data)}
            <div class="footer">
                <p>এই ইমেইলটি Easy-Q প্ল্যাটফর্ম থেকে স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে।</p>
                <p>যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন।</p>
            </div>
        </div>
    </body>
    </html>
  `;
  return baseTemplate;
};

/**
 * Get type-specific content for email templates
 */
const getTypeSpecificContent = (type: string, data?: any) => {
  switch (type) {
    case "purchase":
      return data
        ? `
          <div class="data-section">
            <h3>📦 প্যাকেজ বিবরণ:</h3>
            <p><strong>প্যাকেজ নাম:</strong> ${data.packageName || "N/A"}</p>
            <p><strong>মূল্য:</strong> ৳${data.price || "0"}</p>
            <p><strong>ট্রানজেকশন আইডি:</strong> ${data.transactionId || "N/A"}</p>
            <p><strong>পেমেন্ট মেথড:</strong> ${data.paymentMethod || "N/A"}</p>
          </div>
        `
        : "";

    case "confirmation":
      return data
        ? `
          <div class="data-section">
            <h3>✅ নিশ্চিত করা প্যাকেজ:</h3>
            <p><strong>প্যাকেজ নাম:</strong> ${data.packageName || "N/A"}</p>
            <p><strong>শুরুর তারিখ:</strong> ${data.startDate ? new Date(data.startDate).toLocaleDateString("bn-BD") : "N/A"}</p>
            <p><strong>সমাপ্তি তারিখ:</strong> ${data.endDate ? new Date(data.endDate).toLocaleDateString("bn-BD") : "N/A"}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/user" class="button">ড্যাশবোর্ডে যান</a>
        `
        : "";

    case "expiration_warning":
      return data
        ? `
          <div class="data-section">
            <h3>⚠️ মেয়াদ শেষ হওয়ার সতর্কতা:</h3>
            <p><strong>প্যাকেজ নাম:</strong> ${data.packageName || "N/A"}</p>
            <p><strong>বর্তমান মেয়াদ:</strong> ${data.endDate ? new Date(data.endDate).toLocaleDateString("bn-BD") : "N/A"}</p>
            <p><strong>অবশিষ্ট দিন:</strong> ${data.daysRemaining || "N/A"} দিন</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/pricing" class="button">নতুন প্যাকেজ কিনুন</a>
        `
        : "";

    default:
      return "";
  }
};

/**
 * Get type-specific content for SMS messages
 */
const getSMSDataContent = (type: string, data?: any) => {
  switch (type) {
    case "purchase":
      return data
        ? `\n📦 প্যাকেজ: ${data.packageName || "N/A"}\n💰 মূল্য: ৳${data.price || "0"}\n🆔 ট্রানজেকশন: ${data.transactionId || "N/A"}\n💳 পেমেন্ট: ${data.paymentMethod || "N/A"}`
        : "";

    case "confirmation":
      return data
        ? `\n✅ প্যাকেজ: ${data.packageName || "N/A"}\n📅 শুরু: ${data.startDate ? new Date(data.startDate).toLocaleDateString("bn-BD") : "N/A"}\n📅 শেষ: ${data.endDate ? new Date(data.endDate).toLocaleDateString("bn-BD") : "N/A"}`
        : "";

    case "expiration_warning":
      return data
        ? `\n⚠️ প্যাকেজ: ${data.packageName || "N/A"}\n📅 মেয়াদ শেষ: ${data.endDate ? new Date(data.endDate).toLocaleDateString("bn-BD") : "N/A"}\n⏰ অবশিষ্ট: ${data.daysRemaining || "N/A"} দিন`
        : "";

    default:
      return "";
  }
};

/**
 * Send purchase notifications (to user and admin)
 */
export const sendPurchaseNotifications = async (
  userId: string,
  userEmail: string | null,
  userPhone: string | null,
  userName: string,
  packageData: any,
  paymentData: any,
) => {
  const message = `${userName}, আপনার "${packageData.displayName}" প্যাকেজ অর্ডারটি গৃহীত হয়েছে। অ্যাডমিন অনুমোদনের পর এটি সক্রিয় হবে।`;
  const data = {
    packageName: packageData.displayName,
    price: paymentData.finalPrice,
    transactionId: paymentData.transactionId,
    paymentMethod: paymentData.paymentMethod,
  };

  // Send notification based on registration method
  if (userPhone) {
    // Send SMS if user registered with phone
    await sendSMSNotification({
      type: "purchase",
      title: "প্যাকেজ ক্রয়ের জন্য ধন্যবাদ! 🎉",
      message,
      data,
      phoneTo: userPhone,
    });
  } else if (userEmail) {
    // Send email if user registered with email
    await sendEmailNotification({
      type: "purchase",
      title: "প্যাকেজ ক্রয়ের জন্য ধন্যবাদ! 🎉",
      message,
      data,
      emailTo: userEmail,
    });
  }

  // Email to admin with detailed information
  await sendEmailNotification({
    type: "purchase",
    title: "নতুন প্যাকেজ ক্রয় 💳",
    message: `${userName} (${userEmail}) একটি "${packageData.displayName}" প্যাকেজ কিনেছেন। অনুমোদনের জন্য অপেক্ষমান।`,
    data: {
      userId,
      userName,
      userEmail,
      userPhone: paymentData.phoneNumber,
      packageName: packageData.displayName,
      packageDescription: packageData.description,
      packageDuration: packageData.duration,
      packageFeatures: packageData.features,
      price: paymentData.finalPrice,
      transactionId: paymentData.transactionId,
      paymentMethod: paymentData.paymentMethod,
      subscriptionStart: new Date(),
      subscriptionEnd: (() => {
        const endDate = new Date();
        if (packageData.duration === "monthly") {
          endDate.setMonth(endDate.getMonth() + 1);
        } else if (packageData.duration === "yearly") {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else if (packageData.duration === "lifetime") {
          endDate.setFullYear(endDate.getFullYear() + 100);
        }
        return endDate;
      })(),
    },
    emailTo: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "",
  });
};

/**
 * Send confirmation notification to user
 */
export const sendConfirmationNotification = async (
  userId: string,
  userEmail: string,
  userName: string,
  packageData: any,
  subscriptionData: any,
) => {
  await sendEmailNotification({
    type: "confirmation",
    title: "প্যাকেজ সক্রিয় হয়েছে! 🎊",
    message: `${userName}, আপনার "${packageData.displayName}" প্যাকেজ সফলভাবে সক্রিয় হয়েছে। এখন আপনি সব ফিচার ব্যবহার করতে পারবেন।`,
    data: {
      packageName: packageData.displayName,
      startDate: subscriptionData.startDate,
      endDate: subscriptionData.endDate,
    },
    emailTo: userEmail,
  });
};

/**
 * Send expiration warning notifications
 */
export const sendExpirationWarnings = async () => {
  try {
    // Get subscriptions expiring in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        isActive: true,
        endDate: {
          lte: threeDaysFromNow,
          gte: new Date(),
        },
      },
      include: {
        user: true,
        package: true,
      },
    });

    for (const subscription of expiringSubscriptions) {
      const daysRemaining = Math.ceil(
        (subscription.endDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Send expiration warning notification based on user registration method
      if (subscription.user.email) {
        // Send email if user has email
        await sendEmailNotification({
          type: "expiration_warning",
          title: "প্যাকেজ মেয়াদ শেষ হওয়ার সতর্কতা ⚠️",
          message: `${subscription.user.name}, আপনার "${subscription.package.displayName}" প্যাকেজ ${daysRemaining} দিনের মধ্যে মেয়াদ শেষ হয়ে যাবে। নতুন প্যাকেজ কিনুন।`,
          data: {
            subscriptionId: subscription.id,
            packageName: subscription.package.displayName,
            endDate: subscription.endDate,
            daysRemaining,
          },
          emailTo: subscription.user.email,
        });
      } else if (subscription.user.phone) {
        // Send SMS if user has phone but no email
        await sendSMSNotification({
          type: "expiration_warning",
          title: "প্যাকেজ মেয়াদ শেষ হওয়ার সতর্কতা ⚠️",
          message: `${subscription.user.name}, আপনার "${subscription.package.displayName}" প্যাকেজ ${daysRemaining} দিনের মধ্যে মেয়াদ শেষ হয়ে যাবে। নতুন প্যাকেজ কিনুন।`,
          data: {
            subscriptionId: subscription.id,
            packageName: subscription.package.displayName,
            endDate: subscription.endDate,
            daysRemaining,
          },
          phoneTo: subscription.user.phone,
        });
      }
    }

    console.log(
      `Processed ${expiringSubscriptions.length} expiring subscriptions`,
    );
  } catch (error) {
    console.error("Failed to send expiration warnings:", error);
  }
};
