import { decrypt } from "@/utils/JWT";
import { MiddlewareFactory } from "../middleware";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const checkAuth: MiddlewareFactory = (next) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const pathname = request.nextUrl.pathname;

    if (["/user"]?.some((path) => pathname.includes(path))) {
      const token = request.headers.get("Authorization");
      if (!token)
        return NextResponse.json(
          { error: "Token is required" },
          { status: 404 },
        );

      try {
        const decode = await decrypt(token.split(" ")[1]);
        const headers = new Headers(request.headers);
        headers.set("USER", JSON.stringify(decode));
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization",
        );
        return NextResponse.next({
          request: {
            headers: headers,
          },
        });
      } catch (error) {
        return NextResponse.json(
          {
            error: "Invalid User",
            code: error,
            secret: process.env.SECRET || "cluster0",
          },
          { status: 404 },
        );
      }
    }
    return next(request, _next);
  };
};
export default checkAuth;