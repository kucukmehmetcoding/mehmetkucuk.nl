export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome to your admin panel. Manage your website content and settings.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</p>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">+0% from last month</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Page Views</p>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Analytics integration needed</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SEO Score</p>
              <p className="text-3xl font-bold text-yellow-600">--</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <span className="text-2xl">🔍</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Configure SEO settings</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p>
              <p className="text-3xl font-bold text-green-600">OK</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">All systems operational</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Admin panel setup completed
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Database configured
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              Authentication enabled
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="font-medium text-gray-800 dark:text-white">Configure SEO Settings</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Set up meta tags and search optimization</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="font-medium text-gray-800 dark:text-white">Update Site Information</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Manage contact details and business info</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
