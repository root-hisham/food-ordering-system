import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { getOrderDetail } from "@/services/customer-order.service";
import { OrderTracker } from "./OrderTracker";

export default async function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?redirect=/orders/${params.orderId}`);

  const order = await getOrderDetail(params.orderId, profile.id);
  if (!order) notFound();

  return (
    <main className="mx-auto max-w-md px-4 py-6 pb-24">
      <OrderTracker initialOrder={order} />
    </main>
  );
}