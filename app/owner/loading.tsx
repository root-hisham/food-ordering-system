export default function OwnerLoading() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-7 w-40 rounded" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
