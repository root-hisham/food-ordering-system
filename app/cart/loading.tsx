export default function CartLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-3 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton h-16 w-full rounded-xl" />
      ))}
      <div className="skeleton h-12 w-full rounded-xl" />
    </div>
  );
}
