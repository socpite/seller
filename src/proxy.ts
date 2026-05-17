import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const adminU = process.env.ADMIN_USER || process.env.BASIC_AUTH_USER;
  const adminP = process.env.ADMIN_PASS || process.env.BASIC_AUTH_PASS;
  const cashU = process.env.CASHIER_USER;
  const cashP = process.env.CASHIER_PASS;

  if (!adminU && !cashU) return NextResponse.next();

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const idx = decoded.indexOf(":");
    if (idx >= 0) {
      const u = decoded.slice(0, idx);
      const p = decoded.slice(idx + 1);
      let role: "admin" | "cashier" | null = null;
      if (adminU && u === adminU && p === adminP) role = "admin";
      else if (cashU && u === cashU && p === cashP) role = "cashier";
      if (role) {
        const res = NextResponse.next();
        res.cookies.set("seller_role", role, {
          httpOnly: true,
          sameSite: "strict",
          path: "/",
        });
        return res;
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Seller", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
