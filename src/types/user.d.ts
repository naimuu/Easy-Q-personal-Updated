export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  password?: string;
  isAdmin: boolean;
  credit: number;
  createAt: string;
  passwordUpdateAt: string;
  institute?: Array<{
    id: string;
    name: string;
    phone: string;
    address?: string;
    date: string;
  }>;
  _count?: {
    institute: number;
    question_set: number;
    exams: number;
    subscriptions: number;
    payments: number;
  };
  subscriptions?: Array<{
    id: string;
    package: {
      displayName: string;
      duration: string;
    };
    startDate: string;
    endDate: string;
    isActive: boolean;
  }>;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  credit?: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  isAdmin?: boolean;
  credit?: number;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
