# Quick Setup Guide - Flexible Authentication

## ✅ Completed Implementation

### 1. Database Schema ✓

- Added `phone` field to Users model
- Added `isVerified` field
- Updated OtpMail model with email/phone support
- Migrated database successfully

### 2. SMS Integration ✓

- Created `/src/utils/smsService.ts`
- Integrated sms.net.bd API
- Functions: sendOTPSMS, sendWelcomeSMS, sendPasswordResetOTPSMS

### 3. Backend APIs ✓

Created new API endpoints:

- `/apis/auth/register-flexible` - Register with email or phone
- `/apis/auth/verify-otp` - Verify OTP and create account
- `/apis/auth/send-otp` - Send OTP for login/reset
- `/apis/auth/login-with-otp` - Login with OTP verification
- Updated `/apis/auth/login` - Support phone-based password login

### 4. Frontend Components ✓

- `FlexibleSignUpForm.tsx` - New registration form with email/phone toggle
- `FlexibleSignInForm.tsx` - New login form with password/OTP modes
- Integrated OTP verification screens

### 5. Validation ✓

- Created `/src/app/apis/auth/_validation.ts` with flexible schemas
- Updated admin user validation schemas

## 🚀 Next Steps

### 1. Environment Variables

Add to your `.env`:

```env
# SMS API Configuration
SMS_API_KEY=your_sms_api_key_here
SMS_SENDER_ID=optional_sender_id
```

### 2. Get SMS API Key

1. Visit https://sms.net.bd/
2. Register an account
3. Go to API section
4. Copy your API Key
5. Add to `.env` file

### 3. Test the System

#### Test Registration (Email):

1. Visit `/auth/register`
2. Click "📧 ইমেইল দিয়ে"
3. Fill: Name, Email, Password
4. Check "শর্তাবলী মেনে নিচ্ছি"
5. Click "রেজিস্টার করুন"
6. Check email for OTP
7. Enter OTP and verify

#### Test Registration (Phone):

1. Visit `/auth/register`
2. Click "📱 ফোন দিয়ে"
3. Fill: Name, Phone (01XXXXXXXXX), Password
4. Check "শর্তাবলী মেনে নিচ্ছি"
5. Click "রেজিস্টার করুন"
6. Check SMS for OTP
7. Enter OTP and verify

#### Test Login (Password):

1. Visit `/auth/login`
2. Select email or phone
3. Enter credentials + password
4. Click "লগইন করুন"

#### Test Login (OTP):

1. Visit `/auth/login`
2. Select email or phone
3. Check "OTP দিয়ে লগইন করুন"
4. Enter email/phone
5. Click "OTP পাঠান"
6. Enter OTP received
7. Click "যাচাই করুন"

## 📝 Important Notes

### Phone Number Format

- Input: `01712345678` (11 digits)
- System auto-converts to: `8801712345678`
- Supported operators: 013-019 (Bangladeshi numbers)

### OTP Validity

- Expiry: 5 minutes
- One-time use only
- Auto-marked as used after verification

### Email/Phone Uniqueness

- Handled in application logic (not database unique constraint)
- MongoDB doesn't allow multiple NULL values in unique indexes
- Validation happens before insert/update

### Security

- Passwords: bcrypt hashed (12 rounds)
- JWT tokens: 30 days validity
- OTP: 6-digit random code
- Rate limiting: **Recommended to implement**

## 📚 Documentation

See `FLEXIBLE_AUTH_GUIDE.md` for complete documentation including:

- Full API reference
- Security considerations
- Troubleshooting guide
- Future enhancements

## ✅ Build Status

✅ Application builds successfully
✅ All TypeScript errors resolved
✅ Database schema synced
✅ Ready for testing

## 🎉 You're All Set!

The flexible authentication system is now fully integrated. Users can register and login using either email or phone number with OTP verification.
