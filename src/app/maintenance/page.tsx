export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🔧</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Site Under Maintenance
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We&apos;re currently performing scheduled maintenance to improve your experience.
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            What&apos;s happening?
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• System updates and optimizations</li>
            <li>• Database maintenance</li>
            <li>• Security enhancements</li>
          </ul>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <p>Expected completion: Soon</p>
          <p>We apologize for any inconvenience.</p>
        </div>
        
        <div className="flex justify-center space-x-4 text-gray-400">
          <a href="mailto:info@mehmetkucuk.nl" className="hover:text-blue-600 transition-colors">
            <span className="sr-only">Email</span>
            📧
          </a>
          <a href="https://twitter.com/mehmetkucuk" className="hover:text-blue-600 transition-colors">
            <span className="sr-only">Twitter</span>
            🐦
          </a>
          <a href="/login" className="inline-block mt-4 text-blue-600 hover:text-blue-800 underline text-sm">
            Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}