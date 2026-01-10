# Unit Testing Sheet - easy-q Platform

## Test Coverage Checklist

- [ ] All Critical Features Tested
- [ ] All API Routes Tested
- [ ] All Redux Services Tested
- [ ] All Utility Functions Tested
- [ ] All Middleware Tested
- [ ] All Custom Hooks Tested
- [ ] All Shared Components Tested

---

## 1. AUTHENTICATION SYSTEM

### 1.1 API Routes - Auth (`src/app/apis/auth/`)

#### 1.1.1 POST /apis/auth/login

**Test Cases:**

- [ ] Should successfully login with valid email and password
  - Input:
  - Expected Output:
  - Status:
- [ ] Should fail login with invalid credentials
  - Input:
  - Expected Output:
  - Status:
- [ ] Should fail login with unverified email
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate required fields (email, password)
  - Input:
  - Expected Output:
  - Status:
- [ ] Should return JWT token on successful login
  - Input:
  - Expected Output:
  - Status:

#### 1.1.2 POST /apis/auth/login-admin

**Test Cases:**

- [ ] Should successfully login admin with valid credentials
  - Input:
  - Expected Output:
  - Status:
- [ ] Should fail login for non-admin users
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate admin privileges
  - Input:
  - Expected Output:
  - Status:

#### 1.1.3 POST /apis/auth/login-with-otp

**Test Cases:**

- [ ] Should successfully login with valid OTP
  - Input:
  - Expected Output:
  - Status:
- [ ] Should fail with invalid OTP
  - Input:
  - Expected Output:
  - Status:
- [ ] Should fail with expired OTP
  - Input:
  - Expected Output:
  - Status:
- [ ] Should mark OTP as used after successful login
  - Input:
  - Expected Output:
  - Status:

#### 1.1.4 POST /apis/auth/register

**Test Cases:**

- [ ] Should successfully register new user with email
  - Input:
  - Expected Output:
  - Status:
- [ ] Should fail with existing email
  - Input:
  - Expected Output:
  - Status:
- [ ] Should hash password before saving
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate email format
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate password strength
  - Input:
  - Expected Output:
  - Status:

#### 1.1.5 POST /apis/auth/register-flexible

**Test Cases:**

- [ ] Should register with email
  - Input:
  - Expected Output:
  - Status:
- [ ] Should register with phone number
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate phone number format
  - Input:
  - Expected Output:
  - Status:
- [ ] Should check for duplicate email/phone
  - Input:
  - Expected Output:
  - Status:

#### 1.1.6 POST /apis/auth/reset-password

**Test Cases:**

- [ ] Should successfully reset password with valid token
  - Input:
  - Expected Output:
  - Status:
- [ ] Should fail with invalid token
  - Input:
  - Expected Output:
  - Status:
- [ ] Should hash new password
  - Input:
  - Expected Output:
  - Status:
- [ ] Should update passwordUpdateAt timestamp
  - Input:
  - Expected Output:
  - Status:

#### 1.1.7 POST /apis/auth/send-otp

**Test Cases:**

- [ ] Should send OTP to valid email
  - Input:
  - Expected Output:
  - Status:
- [ ] Should send OTP to valid phone number
  - Input:
  - Expected Output:
  - Status:
- [ ] Should generate unique OTP
  - Input:
  - Expected Output:
  - Status:
- [ ] Should set expiration time for OTP
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate email/phone format
  - Input:
  - Expected Output:
  - Status:

#### 1.1.8 POST /apis/auth/send-reset-mail

**Test Cases:**

- [ ] Should send password reset email to registered user
  - Input:
  - Expected Output:
  - Status:
- [ ] Should fail for non-existent email
  - Input:
  - Expected Output:
  - Status:
- [ ] Should generate reset token
  - Input:
  - Expected Output:
  - Status:

#### 1.1.9 POST /apis/auth/verify-mail

**Test Cases:**

- [ ] Should verify email with valid token
  - Input:
  - Expected Output:
  - Status:
- [ ] Should mark user as verified
  - Input:
  - Expected Output:
  - Status:
- [ ] Should fail with invalid token
  - Input:
  - Expected Output:
  - Status:

#### 1.1.10 POST /apis/auth/verify-otp

**Test Cases:**

- [ ] Should verify valid OTP
  - Input:
  - Expected Output:
  - Status:
- [ ] Should fail with incorrect OTP
  - Input:
  - Expected Output:
  - Status:
- [ ] Should check OTP expiration
  - Input:
  - Expected Output:
  - Status:
- [ ] Should prevent OTP reuse
  - Input:
  - Expected Output:
  - Status:

### 1.2 Redux Services - Auth (`src/redux/services/authApi.ts`)

#### 1.2.1 useLoginMutation

**Test Cases:**

- [ ] Should dispatch login mutation
  - Input:
  - Expected Output:
  - Status:
- [ ] Should store token in Redux state
  - Input:
  - Expected Output:
  - Status:
- [ ] Should handle login errors
  - Input:
  - Expected Output:
  - Status:

#### 1.2.2 useRegisterMutation

**Test Cases:**

- [ ] Should dispatch register mutation
  - Input:
  - Expected Output:
  - Status:
- [ ] Should handle registration errors
  - Input:
  - Expected Output:
  - Status:

### 1.3 Redux Slices - Auth (`src/redux/slices/authSlices.ts`)

#### 1.3.1 setToken Action

**Test Cases:**

- [ ] Should set token in state
  - Input:
  - Expected Output:
  - Status:
- [ ] Should store token in cookies
  - Input:
  - Expected Output:
  - Status:

#### 1.3.2 setMe Action

**Test Cases:**

- [ ] Should set user data in state
  - Input:
  - Expected Output:
  - Status:

#### 1.3.3 clearUser Action

**Test Cases:**

- [ ] Should clear user from state
  - Input:
  - Expected Output:
  - Status:
- [ ] Should clear token from cookies
  - Input:
  - Expected Output:
  - Status:
- [ ] Should reset Redux state
  - Input:
  - Expected Output:
  - Status:

---

## 2. USER MANAGEMENT SYSTEM

### 2.1 API Routes - User (`src/app/apis/user/`)

#### 2.1.1 GET /apis/user

**Test Cases:**

- [ ] Should return current user data
  - Input:
  - Expected Output:
  - Status:
- [ ] Should require authentication
  - Input:
  - Expected Output:
  - Status:
- [ ] Should exclude sensitive fields (password)
  - Input:
  - Expected Output:
  - Status:

#### 2.1.2 PUT /apis/user/update-user

**Test Cases:**

- [ ] Should update user profile
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate input data
  - Input:
  - Expected Output:
  - Status:
- [ ] Should prevent updating email to existing one
  - Input:
  - Expected Output:
  - Status:
- [ ] Should require authentication
  - Input:
  - Expected Output:
  - Status:

#### 2.1.3 GET /apis/user/dashboard

**Test Cases:**

- [ ] Should return dashboard statistics
  - Input:
  - Expected Output:
  - Status:
- [ ] Should include question set counts
  - Input:
  - Expected Output:
  - Status:
- [ ] Should include subscription information
  - Input:
  - Expected Output:
  - Status:

### 2.2 Redux Services - User (`src/redux/services/userService.ts`)

#### 2.2.1 useGetUserQuery

**Test Cases:**

- [ ] Should fetch user data
  - Input:
  - Expected Output:
  - Status:
- [ ] Should cache user data
  - Input:
  - Expected Output:
  - Status:

#### 2.2.2 useUpdateUserMutation

**Test Cases:**

- [ ] Should update user profile
  - Input:
  - Expected Output:
  - Status:
- [ ] Should invalidate cache after update
  - Input:
  - Expected Output:
  - Status:

---

## 3. ADMIN MANAGEMENT SYSTEM

### 3.1 API Routes - Admin Board (`src/app/apis/admin/board/`)

#### 3.1.1 POST /apis/admin/board

**Test Cases:**

- [ ] Should create new board
  - Input:
  - Expected Output:
  - Status:
- [ ] Should require admin privileges
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate board name
  - Input:
  - Expected Output:
  - Status:

#### 3.1.2 GET /apis/admin/board

**Test Cases:**

- [ ] Should return all boards
  - Input:
  - Expected Output:
  - Status:
- [ ] Should support pagination
  - Input:
  - Expected Output:
  - Status:

#### 3.1.3 PUT /apis/admin/board/[id]

**Test Cases:**

- [ ] Should update board by ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate board ID
  - Input:
  - Expected Output:
  - Status:

#### 3.1.4 DELETE /apis/admin/board/[id]

**Test Cases:**

- [ ] Should delete board by ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should cascade delete classes
  - Input:
  - Expected Output:
  - Status:

### 3.2 API Routes - Admin Class (`src/app/apis/admin/class/`)

#### 3.2.1 POST /apis/admin/class

**Test Cases:**

- [ ] Should create new class
  - Input:
  - Expected Output:
  - Status:
- [ ] Should link class to board
  - Input:
  - Expected Output:
  - Status:
- [ ] Should require admin privileges
  - Input:
  - Expected Output:
  - Status:

#### 3.2.2 GET /apis/admin/class

**Test Cases:**

- [ ] Should return all classes
  - Input:
  - Expected Output:
  - Status:
- [ ] Should filter by board ID
  - Input:
  - Expected Output:
  - Status:

#### 3.2.3 PUT /apis/admin/class/[id]

**Test Cases:**

- [ ] Should update class by ID
  - Input:
  - Expected Output:
  - Status:

#### 3.2.4 DELETE /apis/admin/class/[id]

**Test Cases:**

- [ ] Should delete class by ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should cascade delete books
  - Input:
  - Expected Output:
  - Status:

### 3.3 API Routes - Admin Books (`src/app/apis/admin/books/`)

#### 3.3.1 POST /apis/admin/books

**Test Cases:**

- [ ] Should create new book
  - Input:
  - Expected Output:
  - Status:
- [ ] Should upload book cover
  - Input:
  - Expected Output:
  - Status:
- [ ] Should link book to class
  - Input:
  - Expected Output:
  - Status:

#### 3.3.2 GET /apis/admin/books

**Test Cases:**

- [ ] Should return all books
  - Input:
  - Expected Output:
  - Status:
- [ ] Should filter by class ID
  - Input:
  - Expected Output:
  - Status:

#### 3.3.3 PUT /apis/admin/books/[id]

**Test Cases:**

- [ ] Should update book by ID
  - Input:
  - Expected Output:
  - Status:

#### 3.3.4 DELETE /apis/admin/books/[id]

**Test Cases:**

- [ ] Should delete book by ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should cascade delete chapters
  - Input:
  - Expected Output:
  - Status:

### 3.4 API Routes - Admin Chapter (`src/app/apis/admin/chapter/`)

#### 3.4.1 POST /apis/admin/chapter

**Test Cases:**

- [ ] Should create new chapter
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate serial number
  - Input:
  - Expected Output:
  - Status:
- [ ] Should link chapter to book
  - Input:
  - Expected Output:
  - Status:

#### 3.4.2 GET /apis/admin/chapter

**Test Cases:**

- [ ] Should return all chapters
  - Input:
  - Expected Output:
  - Status:
- [ ] Should filter by book ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should sort by serial number
  - Input:
  - Expected Output:
  - Status:

#### 3.4.3 PUT /apis/admin/chapter/[id]

**Test Cases:**

- [ ] Should update chapter by ID
  - Input:
  - Expected Output:
  - Status:

#### 3.4.4 DELETE /apis/admin/chapter/[id]

**Test Cases:**

- [ ] Should delete chapter by ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should cascade delete lessons
  - Input:
  - Expected Output:
  - Status:

### 3.5 API Routes - Admin Lesson (`src/app/apis/admin/lesson/`)

#### 3.5.1 POST /apis/admin/lesson

**Test Cases:**

- [ ] Should create new lesson
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate serial number
  - Input:
  - Expected Output:
  - Status:
- [ ] Should link lesson to chapter
  - Input:
  - Expected Output:
  - Status:

#### 3.5.2 GET /apis/admin/lesson

**Test Cases:**

- [ ] Should return all lessons
  - Input:
  - Expected Output:
  - Status:
- [ ] Should filter by chapter ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should sort by serial number
  - Input:
  - Expected Output:
  - Status:

#### 3.5.3 PUT /apis/admin/lesson/[id]

**Test Cases:**

- [ ] Should update lesson by ID
  - Input:
  - Expected Output:
  - Status:

#### 3.5.4 DELETE /apis/admin/lesson/[id]

**Test Cases:**

- [ ] Should delete lesson by ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should cascade delete questions
  - Input:
  - Expected Output:
  - Status:

### 3.6 API Routes - Admin Users (`src/app/apis/admin/users/`)

#### 3.6.1 GET /apis/admin/users

**Test Cases:**

- [ ] Should return all users
  - Input:
  - Expected Output:
  - Status:
- [ ] Should support pagination
  - Input:
  - Expected Output:
  - Status:
- [ ] Should exclude password field
  - Input:
  - Expected Output:
  - Status:
- [ ] Should require admin privileges
  - Input:
  - Expected Output:
  - Status:

#### 3.6.2 PUT /apis/admin/users/[id]

**Test Cases:**

- [ ] Should update user by ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should update admin status
  - Input:
  - Expected Output:
  - Status:

#### 3.6.3 DELETE /apis/admin/users/[id]

**Test Cases:**

- [ ] Should delete user by ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should cascade delete user data
  - Input:
  - Expected Output:
  - Status:

### 3.7 Redux Services - Admin (`src/redux/services/adminServices.ts`)

#### 3.7.1 Board Service (`boardService.ts`)

**Test Cases:**

- [ ] useGetBoardsQuery should fetch boards
  - Input:
  - Expected Output:
  - Status:
- [ ] useCreateBoardMutation should create board
  - Input:
  - Expected Output:
  - Status:
- [ ] useUpdateBoardMutation should update board
  - Input:
  - Expected Output:
  - Status:
- [ ] useDeleteBoardMutation should delete board
  - Input:
  - Expected Output:
  - Status:

#### 3.7.2 Class Service (`classService.ts`)

**Test Cases:**

- [ ] useGetClassesQuery should fetch classes
  - Input:
  - Expected Output:
  - Status:
- [ ] useCreateClassMutation should create class
  - Input:
  - Expected Output:
  - Status:
- [ ] useUpdateClassMutation should update class
  - Input:
  - Expected Output:
  - Status:
- [ ] useDeleteClassMutation should delete class
  - Input:
  - Expected Output:
  - Status:

#### 3.7.3 Book Service (`bookService.ts`)

**Test Cases:**

- [ ] useGetBooksQuery should fetch books
  - Input:
  - Expected Output:
  - Status:
- [ ] useCreateBookMutation should create book
  - Input:
  - Expected Output:
  - Status:
- [ ] useUpdateBookMutation should update book
  - Input:
  - Expected Output:
  - Status:
- [ ] useDeleteBookMutation should delete book
  - Input:
  - Expected Output:
  - Status:

#### 3.7.4 Chapter/Lesson Service (`chapterLesson.ts`)

**Test Cases:**

- [ ] useGetChaptersQuery should fetch chapters
  - Input:
  - Expected Output:
  - Status:
- [ ] useGetLessonsQuery should fetch lessons
  - Input:
  - Expected Output:
  - Status:
- [ ] useCreateChapterMutation should create chapter
  - Input:
  - Expected Output:
  - Status:
- [ ] useCreateLessonMutation should create lesson
  - Input:
  - Expected Output:
  - Status:

---

## 4. QUESTION MANAGEMENT SYSTEM

### 4.1 API Routes - User Question (`src/app/apis/user/question/`)

#### 4.1.1 GET /apis/user/question

**Test Cases:**

- [ ] Should return questions for user
  - Input:
  - Expected Output:
  - Status:
- [ ] Should filter by lesson ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should filter by category ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should include options
  - Input:
  - Expected Output:
  - Status:

#### 4.1.2 POST /apis/user/create-question

**Test Cases:**

- [ ] Should create question with options
  - Input:
  - Expected Output:
  - Status:
- [ ] Should link question to lesson and category
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate required fields
  - Input:
  - Expected Output:
  - Status:
- [ ] Should support context-based questions
  - Input:
  - Expected Output:
  - Status:

### 4.2 API Routes - Admin Question (`src/app/apis/admin/question/`)

#### 4.2.1 GET /apis/admin/question

**Test Cases:**

- [ ] Should return all questions
  - Input:
  - Expected Output:
  - Status:
- [ ] Should support pagination
  - Input:
  - Expected Output:
  - Status:

#### 4.2.2 PUT /apis/admin/question/[id]

**Test Cases:**

- [ ] Should update question by ID
  - Input:
  - Expected Output:
  - Status:

#### 4.2.3 DELETE /apis/admin/question/[id]

**Test Cases:**

- [ ] Should delete question by ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should cascade delete options
  - Input:
  - Expected Output:
  - Status:

### 4.3 API Routes - Category (`src/app/apis/admin/category/`)

#### 4.3.1 POST /apis/admin/category

**Test Cases:**

- [ ] Should create new category
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate category name
  - Input:
  - Expected Output:
  - Status:

#### 4.3.2 GET /apis/admin/category

**Test Cases:**

- [ ] Should return all categories
  - Input:
  - Expected Output:
  - Status:

#### 4.3.3 PUT /apis/admin/category/[id]

**Test Cases:**

- [ ] Should update category by ID
  - Input:
  - Expected Output:
  - Status:

#### 4.3.4 DELETE /apis/admin/category/[id]

**Test Cases:**

- [ ] Should delete category by ID
  - Input:
  - Expected Output:
  - Status:

### 4.4 Redux Services - Question (`src/redux/services/userServices/questionService.ts`)

#### 4.4.1 useGetQuestionsQuery

**Test Cases:**

- [ ] Should fetch questions
  - Input:
  - Expected Output:
  - Status:
- [ ] Should cache question data
  - Input:
  - Expected Output:
  - Status:

#### 4.4.2 useCreateQuestionMutation

**Test Cases:**

- [ ] Should create question
  - Input:
  - Expected Output:
  - Status:
- [ ] Should invalidate cache after creation
  - Input:
  - Expected Output:
  - Status:

---

## 5. QUESTION SET SYSTEM

### 5.1 API Routes - Question Set (`src/app/apis/user/`)

#### 5.1.1 POST /apis/user/question-set

**Test Cases:**

- [ ] Should create question set
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate quota limits
  - Input:
  - Expected Output:
  - Status:
- [ ] Should track usage count
  - Input:
  - Expected Output:
  - Status:
- [ ] Should link to institute
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate number type
  - Input:
  - Expected Output:
  - Status:

#### 5.1.2 GET /apis/user/question-set

**Test Cases:**

- [ ] Should return user's question sets
  - Input:
  - Expected Output:
  - Status:
- [ ] Should support pagination
  - Input:
  - Expected Output:
  - Status:
- [ ] Should include related data (book, class, board)
  - Input:
  - Expected Output:
  - Status:

#### 5.1.3 PUT /apis/user/question-set/[id]

**Test Cases:**

- [ ] Should update question set
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate ownership
  - Input:
  - Expected Output:
  - Status:

#### 5.1.4 DELETE /apis/user/question-set/[id]

**Test Cases:**

- [ ] Should delete question set
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate ownership
  - Input:
  - Expected Output:
  - Status:

---

## 6. INSTITUTE MANAGEMENT SYSTEM

### 6.1 API Routes - Institute (`src/app/apis/user/institute/`)

#### 6.1.1 POST /apis/user/institute

**Test Cases:**

- [ ] Should create new institute
  - Input:
  - Expected Output:
  - Status:
- [ ] Should upload institute image
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate required fields
  - Input:
  - Expected Output:
  - Status:
- [ ] Should link institute to user
  - Input:
  - Expected Output:
  - Status:

#### 6.1.2 GET /apis/user/institute

**Test Cases:**

- [ ] Should return user's institutes
  - Input:
  - Expected Output:
  - Status:

#### 6.1.3 PUT /apis/user/institute/[id]

**Test Cases:**

- [ ] Should update institute by ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate ownership
  - Input:
  - Expected Output:
  - Status:

#### 6.1.4 DELETE /apis/user/institute/[id]

**Test Cases:**

- [ ] Should delete institute by ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should cascade delete question sets
  - Input:
  - Expected Output:
  - Status:

### 6.2 Redux Services - Institute (`src/redux/services/userServices/instituteService.ts`)

#### 6.2.1 useGetInstitutesQuery

**Test Cases:**

- [ ] Should fetch institutes
  - Input:
  - Expected Output:
  - Status:

#### 6.2.2 useCreateInstituteMutation

**Test Cases:**

- [ ] Should create institute
  - Input:
  - Expected Output:
  - Status:

#### 6.2.3 useUpdateInstituteMutation

**Test Cases:**

- [ ] Should update institute
  - Input:
  - Expected Output:
  - Status:

#### 6.2.4 useDeleteInstituteMutation

**Test Cases:**

- [ ] Should delete institute
  - Input:
  - Expected Output:
  - Status:

---

## 7. SUBSCRIPTION & PAYMENT SYSTEM

### 7.1 API Routes - Packages (`src/app/apis/packages/`)

#### 7.1.1 GET /apis/packages

**Test Cases:**

- [ ] Should return all active packages
  - Input:
  - Expected Output:
  - Status:
- [ ] Should sort by sortOrder
  - Input:
  - Expected Output:
  - Status:
- [ ] Should include features and limits
  - Input:
  - Expected Output:
  - Status:

#### 7.1.2 POST /apis/admin/packages

**Test Cases:**

- [ ] Should create new package
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate slug uniqueness
  - Input:
  - Expected Output:
  - Status:
- [ ] Should require admin privileges
  - Input:
  - Expected Output:
  - Status:

#### 7.1.3 PUT /apis/admin/packages/[id]

**Test Cases:**

- [ ] Should update package by ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should update features dynamically
  - Input:
  - Expected Output:
  - Status:

#### 7.1.4 DELETE /apis/admin/packages/[id]

**Test Cases:**

- [ ] Should delete package by ID
  - Input:
  - Expected Output:
  - Status:

### 7.2 API Routes - Payments (`src/app/apis/user/payment/`)

#### 7.2.1 POST /apis/user/payment

**Test Cases:**

- [ ] Should create payment record
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate phone number
  - Input:
  - Expected Output:
  - Status:
- [ ] Should calculate final price with discount
  - Input:
  - Expected Output:
  - Status:
- [ ] Should set initial status as pending
  - Input:
  - Expected Output:
  - Status:

#### 7.2.2 GET /apis/user/payment

**Test Cases:**

- [ ] Should return user's payments
  - Input:
  - Expected Output:
  - Status:
- [ ] Should include package details
  - Input:
  - Expected Output:
  - Status:

#### 7.2.3 GET /apis/admin/payments

**Test Cases:**

- [ ] Should return all payments
  - Input:
  - Expected Output:
  - Status:
- [ ] Should support filtering by status
  - Input:
  - Expected Output:
  - Status:
- [ ] Should require admin privileges
  - Input:
  - Expected Output:
  - Status:

#### 7.2.4 PUT /apis/admin/payments/[id]

**Test Cases:**

- [ ] Should update payment status
  - Input:
  - Expected Output:
  - Status:
- [ ] Should create subscription on completion
  - Input:
  - Expected Output:
  - Status:

### 7.3 API Routes - Subscription (`src/app/apis/user/subscribe/`)

#### 7.3.1 POST /apis/user/subscribe

**Test Cases:**

- [ ] Should create subscription
  - Input:
  - Expected Output:
  - Status:
- [ ] Should link to payment
  - Input:
  - Expected Output:
  - Status:
- [ ] Should calculate end date based on duration
  - Input:
  - Expected Output:
  - Status:
- [ ] Should update user's currentPackage
  - Input:
  - Expected Output:
  - Status:

#### 7.3.2 GET /apis/user/subscribe

**Test Cases:**

- [ ] Should return user's active subscription
  - Input:
  - Expected Output:
  - Status:
- [ ] Should include package details
  - Input:
  - Expected Output:
  - Status:
- [ ] Should include usage data
  - Input:
  - Expected Output:
  - Status:

#### 7.3.3 GET /apis/admin/subscription

**Test Cases:**

- [ ] Should return all subscriptions
  - Input:
  - Expected Output:
  - Status:
- [ ] Should support filtering by status
  - Input:
  - Expected Output:
  - Status:

### 7.4 Redux Services - Subscription (`src/redux/services/userServices/purchaseSubscriptionService.ts`)

#### 7.4.1 usePurchaseSubscriptionMutation

**Test Cases:**

- [ ] Should purchase subscription
  - Input:
  - Expected Output:
  - Status:
- [ ] Should update user state after purchase
  - Input:
  - Expected Output:
  - Status:

#### 7.4.2 useGetActiveSubscriptionQuery

**Test Cases:**

- [ ] Should fetch active subscription
  - Input:
  - Expected Output:
  - Status:

---

## 8. FEATURE ACCESS SYSTEM

### 8.1 API Routes - Features (`src/app/apis/features/`)

#### 8.1.1 GET /apis/features

**Test Cases:**

- [ ] Should return all active features
  - Input:
  - Expected Output:
  - Status:

#### 8.1.2 POST /apis/admin/features

**Test Cases:**

- [ ] Should create new feature
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate key uniqueness
  - Input:
  - Expected Output:
  - Status:
- [ ] Should require admin privileges
  - Input:
  - Expected Output:
  - Status:

#### 8.1.3 PUT /apis/admin/features/[id]

**Test Cases:**

- [ ] Should update feature by ID
  - Input:
  - Expected Output:
  - Status:
- [ ] Should toggle isActive status
  - Input:
  - Expected Output:
  - Status:

#### 8.1.4 DELETE /apis/admin/features/[id]

**Test Cases:**

- [ ] Should delete feature by ID
  - Input:
  - Expected Output:
  - Status:

### 8.2 Custom Hooks - Feature Access (`src/hooks/use-feature-access.ts`)

#### 8.2.1 useFeatureAccess Hook

**Test Cases:**

- [ ] Should check feature access for user's package
  - Input:
  - Expected Output:
  - Status:
- [ ] Should return false for unavailable features
  - Input:
  - Expected Output:
  - Status:
- [ ] Should handle free tier correctly
  - Input:
  - Expected Output:
  - Status:

### 8.3 Custom Hooks - Quota Management (`src/hooks/use-quota.ts`)

#### 8.3.1 useQuota Hook

**Test Cases:**

- [ ] Should check quota limits
  - Input:
  - Expected Output:
  - Status:
- [ ] Should return remaining quota
  - Input:
  - Expected Output:
  - Status:
- [ ] Should handle unlimited quota
  - Input:
  - Expected Output:
  - Status:

---

## 9. MIDDLEWARE SYSTEM

### 9.1 Authentication Middleware (`src/middleware/checkAuth.ts`)

#### 9.1.1 checkAuth

**Test Cases:**

- [ ] Should validate JWT token
  - Input:
  - Expected Output:
  - Status:
- [ ] Should extract user from token
  - Input:
  - Expected Output:
  - Status:
- [ ] Should reject expired tokens
  - Input:
  - Expected Output:
  - Status:
- [ ] Should reject invalid tokens
  - Input:
  - Expected Output:
  - Status:
- [ ] Should attach user to request
  - Input:
  - Expected Output:
  - Status:

### 9.2 Admin Middleware (`src/middleware/checkAdmin.ts`)

#### 9.2.1 checkAdmin

**Test Cases:**

- [ ] Should verify admin privileges
  - Input:
  - Expected Output:
  - Status:
- [ ] Should reject non-admin users
  - Input:
  - Expected Output:
  - Status:
- [ ] Should require authentication first
  - Input:
  - Expected Output:
  - Status:

### 9.3 Feature Access Middleware (`src/middleware/checkFeatureAccess.ts`)

#### 9.3.1 checkFeatureAccess

**Test Cases:**

- [ ] Should check feature access for request
  - Input:
  - Expected Output:
  - Status:
- [ ] Should block unauthorized feature access
  - Input:
  - Expected Output:
  - Status:
- [ ] Should allow access for authorized features
  - Input:
  - Expected Output:
  - Status:

---

## 10. UTILITY FUNCTIONS

### 10.1 JWT Utilities (`src/utils/JWT.ts`)

#### 10.1.1 encrypt Function

**Test Cases:**

- [ ] Should create valid JWT token
  - Input:
  - Expected Output:
  - Status:
- [ ] Should include user ID in payload
  - Input:
  - Expected Output:
  - Status:
- [ ] Should include isAdmin in payload
  - Input:
  - Expected Output:
  - Status:
- [ ] Should set expiration date
  - Input:
  - Expected Output:
  - Status:

#### 10.1.2 decrypt Function

**Test Cases:**

- [ ] Should decode valid JWT token
  - Input:
  - Expected Output:
  - Status:
- [ ] Should extract user data from token
  - Input:
  - Expected Output:
  - Status:
- [ ] Should throw error for invalid token
  - Input:
  - Expected Output:
  - Status:

### 10.2 Error Handling (`src/utils/catchAsync.ts`)

#### 10.2.1 catchAsync Wrapper

**Test Cases:**

- [ ] Should catch async errors
  - Input:
  - Expected Output:
  - Status:
- [ ] Should format error response
  - Input:
  - Expected Output:
  - Status:
- [ ] Should handle Yup validation errors
  - Input:
  - Expected Output:
  - Status:

### 10.3 Server Response (`src/utils/serverError.ts`)

#### 10.3.1 successResponse Function

**Test Cases:**

- [ ] Should return success response format
  - Input:
  - Expected Output:
  - Status:
- [ ] Should include data in response
  - Input:
  - Expected Output:
  - Status:

#### 10.3.2 errorResponse Function

**Test Cases:**

- [ ] Should return error response format
  - Input:
  - Expected Output:
  - Status:
- [ ] Should include error message
  - Input:
  - Expected Output:
  - Status:
- [ ] Should set appropriate status code
  - Input:
  - Expected Output:
  - Status:

### 10.4 OTP Utilities (`src/utils/otpUtils.ts`)

#### 10.4.1 generateOTP Function

**Test Cases:**

- [ ] Should generate 6-digit OTP
  - Input:
  - Expected Output:
  - Status:
- [ ] Should generate unique OTP
  - Input:
  - Expected Output:
  - Status:

#### 10.4.2 verifyOTP Function

**Test Cases:**

- [ ] Should verify valid OTP
  - Input:
  - Expected Output:
  - Status:
- [ ] Should reject expired OTP
  - Input:
  - Expected Output:
  - Status:
- [ ] Should reject used OTP
  - Input:
  - Expected Output:
  - Status:

### 10.5 Mailer Service (`src/utils/mailer.ts`)

#### 10.5.1 sendEmail Function

**Test Cases:**

- [ ] Should send email successfully
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate email address
  - Input:
  - Expected Output:
  - Status:
- [ ] Should handle email sending errors
  - Input:
  - Expected Output:
  - Status:

### 10.6 SMS Service (`src/utils/smsService.ts`)

#### 10.6.1 sendSMS Function

**Test Cases:**

- [ ] Should send SMS successfully
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate phone number format
  - Input:
  - Expected Output:
  - Status:
- [ ] Should handle SMS sending errors
  - Input:
  - Expected Output:
  - Status:

### 10.7 Image Upload (`src/utils/uploadImage.ts`)

#### 10.7.1 uploadImage Function

**Test Cases:**

- [ ] Should upload image to Cloudinary
  - Input:
  - Expected Output:
  - Status:
- [ ] Should return image URL
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate image format
  - Input:
  - Expected Output:
  - Status:
- [ ] Should handle upload errors
  - Input:
  - Expected Output:
  - Status:

### 10.8 Usage Tracking (`src/utils/trackUsage.ts`)

#### 10.8.1 trackUsage Function

**Test Cases:**

- [ ] Should track user action
  - Input:
  - Expected Output:
  - Status:
- [ ] Should increment usage count
  - Input:
  - Expected Output:
  - Status:
- [ ] Should check quota limits
  - Input:
  - Expected Output:
  - Status:

### 10.9 Subscription Usage Tracking (`src/utils/trackSubscriptionUsage.ts`)

#### 10.9.1 trackSubscriptionUsage Function

**Test Cases:**

- [ ] Should update subscription usage data
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate against package limits
  - Input:
  - Expected Output:
  - Status:
- [ ] Should prevent exceeding quota
  - Input:
  - Expected Output:
  - Status:

### 10.10 Feature Helpers (`src/utils/feature-helpers.ts`)

#### 10.10.1 hasFeatureAccess Function

**Test Cases:**

- [ ] Should check if package has feature
  - Input:
  - Expected Output:
  - Status:
- [ ] Should return false for unavailable features
  - Input:
  - Expected Output:
  - Status:

#### 10.10.2 getFeatureValue Function

**Test Cases:**

- [ ] Should get feature value from package
  - Input:
  - Expected Output:
  - Status:
- [ ] Should return default if not found
  - Input:
  - Expected Output:
  - Status:

---

## 11. SHARED COMPONENTS

### 11.1 Input Component (`src/components/shared/Input.tsx`)

**Test Cases:**

- [ ] Should render input field
  - Props:
  - Expected Output:
  - Status:
- [ ] Should display error message
  - Props:
  - Expected Output:
  - Status:
- [ ] Should handle onChange event
  - Props:
  - Expected Output:
  - Status:

### 11.2 Button Component (`src/components/shared/Button.tsx`)

**Test Cases:**

- [ ] Should render button
  - Props:
  - Expected Output:
  - Status:
- [ ] Should handle onClick event
  - Props:
  - Expected Output:
  - Status:
- [ ] Should show loading state
  - Props:
  - Expected Output:
  - Status:

### 11.3 Select Component (`src/components/shared/Select.tsx`)

**Test Cases:**

- [ ] Should render select dropdown
  - Props:
  - Expected Output:
  - Status:
- [ ] Should display options
  - Props:
  - Expected Output:
  - Status:
- [ ] Should handle selection change
  - Props:
  - Expected Output:
  - Status:

### 11.4 Dialog Component (`src/components/shared/Dialog.tsx`)

**Test Cases:**

- [ ] Should open dialog
  - Props:
  - Expected Output:
  - Status:
- [ ] Should close dialog
  - Props:
  - Expected Output:
  - Status:
- [ ] Should render children content
  - Props:
  - Expected Output:
  - Status:

### 11.5 Loader Component (`src/components/shared/Loader.tsx`)

**Test Cases:**

- [ ] Should render loading spinner
  - Props:
  - Expected Output:
  - Status:
- [ ] Should display loading message
  - Props:
  - Expected Output:
  - Status:

### 11.6 OTPInput Component (`src/components/shared/OTPInput.tsx`)

**Test Cases:**

- [ ] Should render OTP input fields
  - Props:
  - Expected Output:
  - Status:
- [ ] Should handle OTP input
  - Props:
  - Expected Output:
  - Status:
- [ ] Should validate OTP length
  - Props:
  - Expected Output:
  - Status:

### 11.7 FeatureLockBadge Component (`src/components/shared/FeatureLockBadge.tsx`)

**Test Cases:**

- [ ] Should display lock badge for unavailable features
  - Props:
  - Expected Output:
  - Status:
- [ ] Should hide badge for available features
  - Props:
  - Expected Output:
  - Status:

### 11.8 PurchaseModal Component (`src/components/shared/PurchaseModal.tsx`)

**Test Cases:**

- [ ] Should display package options
  - Props:
  - Expected Output:
  - Status:
- [ ] Should handle package selection
  - Props:
  - Expected Output:
  - Status:
- [ ] Should initiate purchase flow
  - Props:
  - Expected Output:
  - Status:

### 11.9 QuotaWarning Component (`src/components/shared/QuotaWarning.tsx`)

**Test Cases:**

- [ ] Should display quota warning
  - Props:
  - Expected Output:
  - Status:
- [ ] Should show remaining quota
  - Props:
  - Expected Output:
  - Status:

### 11.10 QuotaExceededModal Component (`src/components/shared/QuotaExceededModal.tsx`)

**Test Cases:**

- [ ] Should display when quota exceeded
  - Props:
  - Expected Output:
  - Status:
- [ ] Should prompt upgrade
  - Props:
  - Expected Output:
  - Status:

---

## 12. CUSTOM HOOKS

### 12.1 useClickOutside Hook (`src/hooks/use-click-outside.ts`)

**Test Cases:**

- [ ] Should detect click outside element
  - Input:
  - Expected Output:
  - Status:
- [ ] Should trigger callback on outside click
  - Input:
  - Expected Output:
  - Status:

### 12.2 useDebounce Hook (`src/hooks/use-debounce.ts`)

**Test Cases:**

- [ ] Should debounce value changes
  - Input:
  - Expected Output:
  - Status:
- [ ] Should delay update by specified time
  - Input:
  - Expected Output:
  - Status:

### 12.3 useMobile Hook (`src/hooks/use-mobile.ts`)

**Test Cases:**

- [ ] Should detect mobile viewport
  - Input:
  - Expected Output:
  - Status:
- [ ] Should update on resize
  - Input:
  - Expected Output:
  - Status:

---

## 13. NOTIFICATION SYSTEM

### 13.1 API Routes - Notifications (`src/app/apis/user/notifications/`)

#### 13.1.1 GET /apis/user/notifications

**Test Cases:**

- [ ] Should return user notifications
  - Input:
  - Expected Output:
  - Status:
- [ ] Should support pagination
  - Input:
  - Expected Output:
  - Status:

#### 13.1.2 PUT /apis/user/notifications/[id]

**Test Cases:**

- [ ] Should mark notification as read
  - Input:
  - Expected Output:
  - Status:

### 13.2 Email Notification Service (`src/utils/emailNotificationService.ts`)

#### 13.2.1 sendSubscriptionConfirmation

**Test Cases:**

- [ ] Should send subscription confirmation email
  - Input:
  - Expected Output:
  - Status:

#### 13.2.2 sendPaymentReceipt

**Test Cases:**

- [ ] Should send payment receipt email
  - Input:
  - Expected Output:
  - Status:

---

## 14. DASHBOARD & ANALYTICS

### 14.1 API Routes - User Dashboard (`src/app/apis/user/dashboard/`)

#### 14.1.1 GET /apis/user/dashboard

**Test Cases:**

- [ ] Should return dashboard statistics
  - Input:
  - Expected Output:
  - Status:
- [ ] Should include question set count
  - Input:
  - Expected Output:
  - Status:
- [ ] Should include subscription status
  - Input:
  - Expected Output:
  - Status:
- [ ] Should include usage statistics
  - Input:
  - Expected Output:
  - Status:

### 14.2 Redux Services - Dashboard (`src/redux/services/userServices/dashboardService.ts`)

#### 14.2.1 useGetDashboardQuery

**Test Cases:**

- [ ] Should fetch dashboard data
  - Input:
  - Expected Output:
  - Status:
- [ ] Should cache dashboard data
  - Input:
  - Expected Output:
  - Status:

### 14.3 Charts Service (`src/services/charts.services.ts`)

#### 14.3.1 Chart Data Processing

**Test Cases:**

- [ ] Should format data for charts
  - Input:
  - Expected Output:
  - Status:
- [ ] Should handle empty data
  - Input:
  - Expected Output:
  - Status:

---

## 15. FILE UPLOAD SYSTEM

### 15.1 API Routes - Upload (`src/app/apis/upload/`)

#### 15.1.1 POST /apis/upload

**Test Cases:**

- [ ] Should upload file to Cloudinary
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate file type
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate file size
  - Input:
  - Expected Output:
  - Status:
- [ ] Should return uploaded file URL
  - Input:
  - Expected Output:
  - Status:

---

## 16. CRON JOBS & SCHEDULED TASKS

### 16.1 API Routes - Cron (`src/app/apis/cron/`)

#### 16.1.1 Subscription Expiry Check

**Test Cases:**

- [ ] Should identify expired subscriptions
  - Input:
  - Expected Output:
  - Status:
- [ ] Should deactivate expired subscriptions
  - Input:
  - Expected Output:
  - Status:
- [ ] Should send expiry notifications
  - Input:
  - Expected Output:
  - Status:

---

## 17. DATABASE INTEGRATION

### 17.1 Prisma Client (`src/config/prisma.ts`)

#### 17.1.1 Database Connection

**Test Cases:**

- [ ] Should connect to MongoDB
  - Input:
  - Expected Output:
  - Status:
- [ ] Should handle connection errors
  - Input:
  - Expected Output:
  - Status:

### 17.2 Data Models - Cascade Delete

#### 17.2.1 Board → Classes → Books → Chapters → Lessons

**Test Cases:**

- [ ] Should cascade delete classes when board deleted
  - Input:
  - Expected Output:
  - Status:
- [ ] Should cascade delete books when class deleted
  - Input:
  - Expected Output:
  - Status:
- [ ] Should cascade delete chapters when book deleted
  - Input:
  - Expected Output:
  - Status:
- [ ] Should cascade delete lessons when chapter deleted
  - Input:
  - Expected Output:
  - Status:

#### 17.2.2 Users → Subscriptions → Payments

**Test Cases:**

- [ ] Should cascade delete subscriptions when user deleted
  - Input:
  - Expected Output:
  - Status:
- [ ] Should cascade delete payments when user deleted
  - Input:
  - Expected Output:
  - Status:

---

## 18. VALIDATION SYSTEM

### 18.1 Yup Validation Schemas (`validations.ts`)

#### 18.1.1 Login Schema

**Test Cases:**

- [ ] Should validate email format
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate password requirements
  - Input:
  - Expected Output:
  - Status:

#### 18.1.2 Register Schema

**Test Cases:**

- [ ] Should validate all required fields
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate password strength
  - Input:
  - Expected Output:
  - Status:

#### 18.1.3 Question Creation Schema

**Test Cases:**

- [ ] Should validate question data
  - Input:
  - Expected Output:
  - Status:
- [ ] Should validate options array
  - Input:
  - Expected Output:
  - Status:

---

## 19. INTEGRATION TESTS

### 19.1 End-to-End User Flow

#### 19.1.1 Complete User Registration & Login Flow

**Test Cases:**

- [ ] User registers → Receives OTP → Verifies → Logs in
  - Steps:
  - Expected Output:
  - Status:

#### 19.1.2 Complete Subscription Purchase Flow

**Test Cases:**

- [ ] User selects package → Makes payment → Subscription activated
  - Steps:
  - Expected Output:
  - Status:

#### 19.1.3 Complete Question Set Creation Flow

**Test Cases:**

- [ ] User creates institute → Creates questions → Generates question set
  - Steps:
  - Expected Output:
  - Status:

### 19.2 Admin Management Flow

#### 19.2.1 Complete Content Hierarchy Creation

**Test Cases:**

- [ ] Admin creates board → class → book → chapter → lesson
  - Steps:
  - Expected Output:
  - Status:

---

## 20. PERFORMANCE & SECURITY TESTS

### 20.1 Performance Tests

#### 20.1.1 API Response Time

**Test Cases:**

- [ ] All API endpoints respond within 2 seconds
  - Endpoint:
  - Expected Time:
  - Actual Time:
  - Status:

#### 20.1.2 Database Query Optimization

**Test Cases:**

- [ ] Complex queries use proper indexes
  - Query:
  - Execution Time:
  - Status:

### 20.2 Security Tests

#### 20.2.1 Authentication & Authorization

**Test Cases:**

- [ ] Unauthorized users cannot access protected routes
  - Route:
  - Test Result:
  - Status:
- [ ] Non-admin users cannot access admin routes
  - Route:
  - Test Result:
  - Status:

#### 20.2.2 Data Validation

**Test Cases:**

- [ ] All inputs are validated and sanitized
  - Input Type:
  - Validation Method:
  - Status:

#### 20.2.3 Token Security

**Test Cases:**

- [ ] Expired tokens are rejected
  - Test Result:
  - Status:
- [ ] Invalid tokens are rejected
  - Test Result:
  - Status:

---

## TEST EXECUTION SUMMARY

### Overall Progress

- **Total Test Cases**: \_\_\_
- **Completed**: \_\_\_
- **Failed**: \_\_\_
- **Pending**: \_\_\_
- **Blocked**: \_\_\_

### Coverage by Module

| Module              | Total Tests | Passed | Failed | Pending | Coverage % |
| ------------------- | ----------- | ------ | ------ | ------- | ---------- |
| Authentication      | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |
| User Management     | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |
| Admin Management    | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |
| Question Management | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |
| Question Sets       | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |
| Institutes          | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |
| Subscriptions       | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |
| Payments            | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |
| Features            | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |
| Middleware          | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |
| Utils               | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |
| Components          | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |
| Hooks               | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |
| Integration         | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |
| Performance         | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |
| Security            | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_  | \_\_\_%    |

### Critical Issues Found

1.
2.
3.

### Test Environment Details

- **Node Version**: \_\_\_
- **Database**: MongoDB
- **Testing Framework**: \_\_\_
- **Date Started**: \_\_\_
- **Date Completed**: \_\_\_
- **Tester Name**: \_\_\_

---

## NOTES & OBSERVATIONS

### Blockers

-

### Test Data Requirements

-

### Dependencies

-

### Recommendations

-
