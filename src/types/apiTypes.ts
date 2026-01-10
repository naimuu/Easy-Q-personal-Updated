export interface User {
  id: string;
  email: string;
  password: string;
  phone: string | null;
  name: string;
  dob: string | null;
  gender: string | null;
  isAdmin: boolean;
  image: string | null;
  socketId: string | null;
  pushToken: string | null;
  createdAt: string;
  passwordUpdateAt: string | null;
}
export interface Admin {
  id: string;
  email: string;
  password: string;
  phone: string | null;
  name: string;
  image: string | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  passwordUpdateAt: string;
  accessList: string[];
}
export interface UserResponse {
  result: User;
}
export interface AdminAuthResponse {
  message: string;
  admin: Admin;
  token: string;
}
export interface AuthResponse {
  user: User;
  token: string;
}
