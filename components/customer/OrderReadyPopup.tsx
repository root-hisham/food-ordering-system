"use client";

export function OrderReadyPopup({
  orderNumber,
  stallName,
  onClose,
  onView,
}: {
  orderNumber: string;
  stallName: string;
  onClose: () => void;
  onView: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <p className="text-4xl">🎉</p>
        <h2 className="mt-2 text-xl font-semibold">Food Ready!</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Your order {orderNumber} from {stallName} is ready for pickup.
        </p>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-300 py-2 text-sm font-medium">
            Dismiss
          </button>
          <button
            onClick={onView}
            className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 py-2 text-sm font-medium text-white"
          >
            View Order
          </button>
        </div>
      </div>
    </div>
  );
}