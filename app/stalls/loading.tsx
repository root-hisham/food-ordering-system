export default function StallsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-3 p-4">
      <div className="skeleton mb-2 h-9 w-full rounded-xl" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}
