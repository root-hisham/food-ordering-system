export default function AdminLoading() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-7 w-40 rounded" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
