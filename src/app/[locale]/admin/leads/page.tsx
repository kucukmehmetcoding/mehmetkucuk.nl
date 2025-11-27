import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { tr, enUS, nl } from 'date-fns/locale';

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  source: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const localeMap = {
  tr: tr,
  en: enUS,
  nl: nl,
};

export default async function AdminLeadsPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const leads = await prisma.lead.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'converted':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'chat':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'contact':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Leads Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and view all contact form submissions and chat leads.</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Leads</h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
              {leads.length} Total
            </span>
          </div>
          
          {leads.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No leads yet</h3>
              <p className="text-gray-500 dark:text-gray-500">Leads from contact forms and chat will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3">Source</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Notes</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {lead.name || 'Anonymous'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="text-blue-600 dark:text-blue-400">
                              📧 {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="text-green-600 dark:text-green-400">
                              📱 {lead.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getSourceColor(lead.source)}`}>
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="truncate" title={lead.notes || ''}>
                          {lead.notes || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {formatDistanceToNow(lead.createdAt, { 
                          addSuffix: true,
                          locale: localeMap[locale as keyof typeof localeMap] || enUS
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}