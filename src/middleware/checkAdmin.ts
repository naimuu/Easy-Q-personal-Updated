import { MiddlewareFactory } from "../middleware";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/utils/JWT";

const checkAdmin: MiddlewareFactory = (next) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const pathname = request.nextUrl.pathname;

    if (["/admin"]?.some((path) => pathname.includes(path))) {
      const token = request.headers.get("Authorization");
      if (!token)
        return NextResponse.json(
          { error: "Token is required" },
          { status: 404 },
        );

      try {
        const decode = await decrypt(token.split(" ")[1]);
        if (!decode?.isAdmin) {
          return NextResponse.json({ error: "Invalid Admin" }, { status: 404 });
        }
        const headers = new Headers(request.headers);
        headers.set("ADMIN", JSON.stringify(decode));
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
          { error: "Invalid User", code: error },
          { status: 404 },
        );
      }
    }
    return next(request, _next);
  };
};
export default checkAdmin;