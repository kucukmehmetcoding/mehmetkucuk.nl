import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Eye, FileText, Users, Activity } from 'lucide-react';

async function getDashboardMetrics() {
  try {
    const [
      totalLeads,
      newLeads,
      totalBlogPosts,
      publishedPosts,
      totalProjects,
      totalBlogViews,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { published: true } }),
      prisma.project.count(),
      prisma.blogPost.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);

    // Recent leads
    const recentLeads = await prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        email: true,
        source: true,
        status: true,
        createdAt: true,
      },
    });

    // Popular blog posts
    const popularPosts = await prisma.blogPost.findMany({
      take: 5,
      where: { published: true },
      orderBy: { views: 'desc' },
      select: {
        title: true,
        views: true,
        slug: true,
      },
    });

    return {
      totalLeads,
      newLeads,
      totalBlogPosts,
      publishedPosts,
      totalProjects,
      totalBlogViews: totalBlogViews._sum.views || 0,
      recentLeads,
      popularPosts,
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return {
      totalLeads: 0,
      newLeads: 0,
      totalBlogPosts: 0,
      publishedPosts: 0,
      totalProjects: 0,
      totalBlogViews: 0,
      recentLeads: [],
      popularPosts: [],
    };
  }
}

export default async function AdminDashboard() {
  const metrics = await getDashboardMetrics();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          📊 Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back! Here&apos;s what&apos;s happening with your website.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Total Leads</p>
              <p className="text-3xl font-bold mt-1">{metrics.totalLeads}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <Users className="h-8 w-8" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm text-blue-100">
            {metrics.newLeads > 0 ? (
              <>
                <TrendingUp className="h-4 w-4" />
                <span>+{metrics.newLeads} this month</span>
              </>
            ) : (
              <span>No new leads this month</span>
            )}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Blog Views</p>
              <p className="text-3xl font-bold mt-1">{metrics.totalBlogViews.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <Eye className="h-8 w-8" />
            </div>
          </div>
          <p className="text-sm text-green-100 mt-3">Total blog impressions</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Blog Posts</p>
              <p className="text-3xl font-bold mt-1">{metrics.publishedPosts}/{metrics.totalBlogPosts}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <FileText className="h-8 w-8" />
            </div>
          </div>
          <p className="text-sm text-purple-100 mt-3">Published / Total</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-100">Projects</p>
              <p className="text-3xl font-bold mt-1">{metrics.totalProjects}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <Activity className="h-8 w-8" />
            </div>
          </div>
          <p className="text-sm text-orange-100 mt-3">Portfolio showcase</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Leads</h3>
            <Link
              href="/admin/leads"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {metrics.recentLeads.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No leads yet</p>
            ) : (
              metrics.recentLeads.map((lead, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      lead.status === 'new' ? 'bg-green-500' :
                      lead.status === 'contacted' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}>
                      {lead.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {lead.name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{lead.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        lead.status === 'new' ? 'bg-green-100 text-green-700' :
                        lead.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {lead.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Popular Blog Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Popular Posts</h3>
            <Link
              href="/admin/blog"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {metrics.popularPosts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No published posts yet</p>
            ) : (
              metrics.popularPosts.map((post, idx) => {
                const titleData = JSON.parse(post.title);
                const title = titleData.en || titleData.tr;
                return (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold">
                        #{idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                        {title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Eye className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{post.views.toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/blog"
            className="p-4 rounded-lg border dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">Create Blog Post</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Write a new article</div>
          </Link>
          
          <Link
            href="/admin/portfolio"
            className="p-4 rounded-lg border dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
          >
            <div className="text-2xl mb-2">🎨</div>
            <div className="font-medium text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">Add Project</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Showcase your work</div>
          </Link>
          
          <Link
            href="/admin/seo"
            className="p-4 rounded-lg border dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
          >
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-medium text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">SEO Settings</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Optimize meta tags</div>
          </Link>
          
          <Link
            href="/admin/settings"
            className="p-4 rounded-lg border dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all group"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-medium text-gray-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">Site Settings</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Configure options</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
