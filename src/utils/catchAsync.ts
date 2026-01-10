// utils/catchAsync.ts
import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "./serverError";

/**
 * A higher-order function to catch errors in async API handlers
 */
const catchAsync =
  (
    fn: (
      req: NextRequest,
      { params }: { params: Promise<any> },
    ) => Promise<NextResponse>,
  ) =>
    async (
      req: NextRequest,
      { params }: { params: Promise<any> },
    ): Promise<NextResponse> => {
      try {
        const context = { params };
        return await fn(req, context);
      } catch (error) {
        console.error("API Error:", error);
        return errorResponse(error);
      }
    };

export default catchAsync;