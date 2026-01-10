# Flexible Authentication System (Email/Phone + OTP)

## Overview

The Easy-Q platform now supports **flexible authentication** allowing users to register and login using either:

- **Email** (with OTP verification)
- **Phone Number** (with SMS OTP verification)

Users can choose their preferred method during registration and login, and OTP is sent accordingly.

---

## Features

### ✅ Registration

- **Dual Method**: Users can register with either email or phone number
- **OTP Verification**: 6-digit OTP sent via email or SMS
- **Password Protection**: Secure password hashing with bcrypt
- **Toggle UI**: User-friendly interface to switch between email/phone

### ✅ Login

- **Password-based Login**: Traditional login with email/phone + password
- **OTP-based Login**: Passwordless login with OTP (more secure)
- **Flexible Method**: Support both email and phone for login
- **Remember Me**: Optional credential saving

### ✅ Security

- **OTP Expiry**: 5-minute validity period
- **One-time Use**: OTP marked as used after successful verification
- **Encrypted Tokens**: JWT tokens for session management
- **Rate Limiting**: (Recommended to implement)

---

## Database Schema Changes

### Users Model

```prisma
model Users {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  name             String
  email            String?   // Optional - can be null if phone is provided
  phone            String?   // Optional - can be null if email is provided
  password         String
  isVerified       Boolean  @default(false)
  // ... other fields

  @@index([email])
  @@index([phone])
}
```

### OtpMail Model

```prisma
model OtpMail {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  otp          String   @unique
  otpToken     String
  email        String?
  phone        String?
  type         String   // "email" or "phone"
  purpose      String   // "register" or "login" or "reset"
  sentDateTime DateTime @default(now())
  expiresAt    DateTime
  isUsed       Boolean  @default(false)
}
```

---

## API Endpoints

### 1. **Register (Flexible)**

**POST** `/apis/auth/register-flexible`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com", // Optional (if phone not provided)
  "phone": "01712345678", // Optional (if email not provided)
  "password": "securepass123"
}
```

**Response:**

```json
{
  "message": "OTP আপনার ইমেইলে পাঠানো হয়েছে",
  "token": "eyJhbGc...",
  "type": "email"
}
```

---

### 2. **Verify OTP**

**POST** `/apis/auth/verify-otp`

**Request Body:**

```json
{
  "otp": "123456",
  "token": "eyJhbGc..."
}
```

**Response:**

```json
{
  "message": "একাউন্ট সফলভাবে তৈরি হয়েছে!",
  "user": {
    /* user object */
  },
  "token": "authToken..."
}
```

---

### 3. **Send OTP (Login/Reset)**

**POST** `/apis/auth/send-otp`

**Request Body:**

```json
{
  "email": "john@example.com", // Optional
  "phone": "01712345678", // Optional
  "purpose": "login" // "login" | "register" | "reset"
}
```

---

### 4. **Login (Password-based)**

**POST** `/apis/auth/login`

**Request Body:**

```json
{
  "email": "john@example.com", // Or use phone
  "password": "securepass123"
}
```

---

### 5. **Login with OTP**

**POST** `/apis/auth/login-with-otp`

**Request Body:**

```json
{
  "otp": "123456",
  "token": "eyJhbGc..."
}
```

---

## Frontend Components

### Registration Form (`FlexibleSignUpForm.tsx`)

- **Toggle UI**: Switch between email/phone registration
- **Live Validation**: Yup schema validation
- **OTP Screen**: Integrated OTP verification UI
- **Resend OTP**: Option to resend OTP if not received

### Login Form (`FlexibleSignInForm.tsx`)

- **Toggle UI**: Switch between email/phone login
- **Dual Mode**: Password-based or OTP-based login
- **Checkbox**: "Login with OTP" toggle
- **Remember Me**: Save credentials for convenience

---

## SMS Integration (sms.net.bd)

### Configuration

Add to `.env`:

```env
SMS_API_KEY=your_api_key_here
SMS_SENDER_ID=optional_sender_id
```

### SMS Utility (`/utils/smsService.ts`)

Functions:

- `sendSMS(phone, message)` - Generic SMS sender
- `sendOTPSMS(phone, otp)` - Send OTP SMS
- `sendWelcomeSMS(phone, name)` - Welcome message
- `sendPasswordResetOTPSMS(phone, otp)` - Password reset OTP
- `checkSMSBalance()` - Check API balance

### Phone Number Format

- **Input**: `01712345678` (11 digits)
- **Normalized**: `8801712345678` (13 digits with country code)
- **Validation**: Regex `/^(01[3-9]\d{8})$/`

---

## Email Integration

Uses existing `mailer.ts` utility with:

- **Template**: Responsive HTML email design
- **Bangla Support**: Full Unicode support
- **Styled OTP**: Large, bold OTP display
- **Security Notice**: Expiry and usage warnings

---

## Security Considerations

### ✅ Implemented

- Password hashing with bcrypt (12 rounds)
- JWT token encryption
- OTP expiry (5 minutes)
- One-time OTP usage
- Input validation (Yup schemas)

### 🔄 Recommended

- **Rate Limiting**: Limit OTP requests per user/IP
- **2FA**: Optional two-factor authentication
- **Phone Verification**: Verify phone ownership on first use
- **Captcha**: Prevent automated attacks
- **Audit Logs**: Track login attempts

---

## Usage Examples

### User Registration Flow

1. User visits `/auth/register`
2. Selects email or phone method
3. Fills form (name, email/phone, password)
4. Clicks "রেজিস্টার করুন"
5. OTP sent to email/phone
6. User enters OTP
7. Account created + auto-login
8. Redirected to `/user`

### User Login Flow (OTP)

1. User visits `/auth/login`
2. Selects email or phone method
3. Checks "Login with OTP"
4. Enters email/phone
5. Clicks "OTP পাঠান"
6. OTP sent to email/phone
7. User enters OTP
8. Logged in + redirected

### User Login Flow (Password)

1. User visits `/auth/login`
2. Selects email or phone method
3. Enters email/phone + password
4. Clicks "লগইন করুন"
5. Logged in + redirected

---

## Environment Variables

Required variables:

```env
# Existing
DATABASE_URL=mongodb://...
SECRET=jwt_secret
EMAIL_USER=your@email.com
EMAIL_PASS=app_password

# New for SMS
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=optional

# Admin notifications
ADMIN_EMAIL=admin@example.com
CRON_SECRET=cron_secret
```

---

## Migration Guide

### For Existing Users

1. **Email users**: Continue using email + password
2. **No migration needed**: Existing accounts work as-is
3. **Optional**: Users can add phone number later (future feature)

### For New Development

1. Update `.env` with SMS credentials
2. Run `npx prisma db push` (already done)
3. Test registration with both methods
4. Verify OTP delivery (email + SMS)

---

## Testing Checklist

- [ ] Register with email
- [ ] Register with phone
- [ ] Verify OTP (email)
- [ ] Verify OTP (phone)
- [ ] Login with email + password
- [ ] Login with phone + password
- [ ] Login with email + OTP
- [ ] Login with phone + OTP
- [ ] OTP expiry (wait 5 minutes)
- [ ] OTP reuse prevention
- [ ] Invalid OTP handling
- [ ] Resend OTP functionality

---

## Troubleshooting

### SMS Not Sending

- Check `SMS_API_KEY` in `.env`
- Verify phone number format (01XXXXXXXXX)
- Check sms.net.bd account balance
- Review API logs for errors

### Email Not Sending

- Verify `EMAIL_USER` and `EMAIL_PASS`
- Check spam folder
- Test with `nodemailer` directly

### OTP Expired

- Default: 5 minutes validity
- Adjust in code: `expiresAt.setMinutes(expiresAt.getMinutes() + 5)`

### Duplicate User Error

- Check if email/phone already registered
- MongoDB indexes prevent duplicates
- Clear test data if needed

---

## Future Enhancements

- [ ] SMS delivery status tracking
- [ ] WhatsApp integration (optional)
- [ ] Biometric login (mobile apps)
- [ ] Social login (Google, Facebook)
- [ ] Account linking (add email to phone account)
- [ ] SMS templates management
- [ ] Admin SMS balance dashboard
- [ ] OTP analytics and monitoring

---

## Support

For issues or questions:

- Email: support@sms.net.bd (SMS API support)
- Documentation: https://sms.net.bd/api
- Easy-Q Support: [Your support contact]

---

## Credits

- **SMS Provider**: sms.net.bd (Alpha SMS)
- **Email Service**: Nodemailer + Gmail
- **Framework**: Next.js 15 + React 19
- **Database**: MongoDB + Prisma ORM
- **Validation**: Yup + React Hook Form
