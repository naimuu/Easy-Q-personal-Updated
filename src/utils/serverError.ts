import { NextResponse } from "next/server";

const successResponse = (data: object) => {
  return NextResponse.json(data);
};

export class CustomError extends Error {
  statusCode: number;
  details?: string | object;
  errors?: string[];
  code?: string;

  constructor(
    message: string,
    statusCode = 500,
    code?: string,
    details?: string | object,
    errors?: string[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.errors = errors;
    Object.setPrototypeOf(this, CustomError.prototype); // Ensures correct inheritance
  }
}

const errorResponse = (error: unknown) => {
  if (error instanceof CustomError) {
    if (error?.name === "ValidationError" && error?.errors) {
      return NextResponse.json(
        { message: error.errors[0], error: error },
        { status: error.statusCode || 404 },
      );
    }
    if (error?.code == "P2002") {
      return NextResponse.json(
        { message: "Duplicate entry detected.", error: error },
        { status: error.statusCode || 404 },
      );
    }
    if (error?.code == "P2003") {
      return NextResponse.json(
        { message: "Field not exist", error: error },
        { status: error.statusCode || 404 },
      );
    }
  }

  // Check if error has custom properties (for quota exceeded, etc.)
  const errorObj = error as any;
  if (errorObj?.statusCode || errorObj?.code || errorObj?.data) {
    return NextResponse.json(
      {
        success: false,
        message: errorObj?.message || "Internal Server Error",
        code: errorObj?.code,
        data: errorObj?.data,
      },
      { status: errorObj?.statusCode || 500 },
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    },
    { status: 500 },
  );
};
export { successResponse, errorResponse };

// import { NextResponse } from "next/server";

// const successResponse = (data: object) => {
//   return NextResponse.json(data);
// };

// export interface CustomError extends Error {
//   statusCode?: number;
//   details?: string | object;
//   errors?: string[];
//   code?: string;
// }

// const isCustomError = (error: unknown): error is CustomError => {
//   return (
//     typeof error === "object" &&
//     error !== null &&
//     "message" in error &&
//     typeof (error as Record<string, unknown>).message === "string"
//   );
// };

// const errorResponse = (error: unknown) => {
//   if (isCustomError(error)) {
//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error.name === "ValidationError"
//             ? error.errors?.[0] ?? "Validation failed"
//             : error.code === "P2002"
//             ? "Duplicate entry detected."
//             : error.code === "P2003"
//             ? "Field does not exist"
//             : error.message,
//         error,
//       },
//       { status: error.statusCode || 500 }
//     );
//   }

//   return NextResponse.json(
//     { success: false, message: "Internal Server Error" },
//     { status: 500 }
//   );
// };
// export { successResponse, errorResponse };