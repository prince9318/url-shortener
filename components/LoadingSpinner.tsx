export default function LoadingSpinner() {
  return (
    <div className="text-center py-10">
      <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto"></div>
      <p className="mt-2 text-gray-600">Loading...</p>
    </div>
  );
}
