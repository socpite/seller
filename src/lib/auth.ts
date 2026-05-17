import { cookies } from "next/headers";

export type Role = "admin" | "cashier";

export async function getRole(): Promise<Role | null> {
  const c = await cookies();
  const r = c.get("seller_role")?.value;
  if (r === "admin" || r === "cashier") return r;
  if (!process.env.ADMIN_USER && !process.env.CASHIER_USER && !process.env.BASIC_AUTH_USER) {
    return "admin";
  }
  return null;
}

export async function requireAdmin() {
  const role = await getRole();
  if (role !== "admin") throw new Error("Cần quyền admin");
}
