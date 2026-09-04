export default function StallsLoading() {
  return (
    <div className="pb-24">
      <div className="bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 px-4 pb-8 pt-6">
        <div className="skeleton h-8 w-40 rounded-lg" />
        <div className="skeleton mt-2 h-4 w-56 rounded-lg" />
        <div className="skeleton mt-5 h-[3.25rem] w-full rounded-2xl" />
      </div>
      <div className="space-y-3 px-4 pt-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-24 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
