'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Application Error
            </h2>
            <p className="text-gray-600 mb-6">
              Something went wrong. Please refresh the page to try again.
            </p>
            <button
              onClick={reset}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}