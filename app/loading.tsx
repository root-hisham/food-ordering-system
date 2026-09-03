export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div className="skeleton h-36 w-full rounded-2xl" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-16 w-16 shrink-0 rounded-full" />
        ))}
      </div>
      <div>
        <div className="skeleton mb-3 h-5 w-32 rounded" />
        <div className="flex h-52 items-center justify-center gap-4">
          <div className="skeleton h-40 w-36 rounded-2xl" />
          <div className="skeleton h-44 w-40 rounded-2xl" />
          <div className="skeleton h-40 w-36 rounded-2xl" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
