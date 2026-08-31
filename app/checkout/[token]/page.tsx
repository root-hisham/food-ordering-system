import { notFound } from "next/navigation";
import { getGuestOrder, getGuestOrderItems } from "@/services/guest-order.service";
import { GuestOrderTracker } from "./GuestOrderTracker";

export default async function GuestOrderPage({ params }: { params: { token: string } }) {
  const order = await getGuestOrder(params.token);
  if (!order) notFound();

  const items = await getGuestOrderItems(params.token);

  return (
    <main className="mx-auto max-w-md px-4 py-6 pb-24">
      <GuestOrderTracker token={params.token} initialOrder={order} initialItems={items} />
    </main>
  );
}