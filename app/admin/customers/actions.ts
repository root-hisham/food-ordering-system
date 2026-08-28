"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { setCustomerActive } from "@/services/customer.service";

export async function toggleCustomerActiveAction(customerId: string, isActive: boolean) {
  await requireRole(["admin"]);
  await setCustomerActive(customerId, !isActive);
  revalidatePath("/admin/customers");
}