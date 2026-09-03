export default function HistoryLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}
