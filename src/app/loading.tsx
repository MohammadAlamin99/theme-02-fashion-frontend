
export default function Loading() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-32 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="h-64 bg-gray-50 rounded animate-pulse" />
    </div>
  );
}