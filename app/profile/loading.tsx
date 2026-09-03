export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-3 p-4">
      <div className="skeleton h-20 w-20 rounded-full" />
      <div className="skeleton h-6 w-40 rounded" />
      <div className="skeleton h-32 w-full rounded-xl" />
    </div>
  );
}
