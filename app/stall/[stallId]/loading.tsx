export default function StallDetailLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div className="skeleton h-28 w-full rounded-2xl" />
      <div className="skeleton h-10 w-full rounded-xl" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="skeleton h-16 w-16 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
