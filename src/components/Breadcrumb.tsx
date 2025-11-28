'use client';

import { ChevronRight, Home } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function Breadcrumb() {
  const pathname = usePathname();

  if (!pathname) return null;

  const pathSegments = pathname.split('/').filter(Boolean).slice(1); // Remove locale
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
  ];

  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      label,
      href: currentPath,
    });
  });

  if (breadcrumbs.length === 1) return null; // Don't show on home page

  return (
    <nav aria-label="Breadcrumb" className="bg-gray-50 dark:bg-gray-800/50 py-3 px-4 rounded-lg mb-6">
      <ol className="flex items-center space-x-2 text-sm flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li
              key={crumb.href}
              className="flex items-center"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {index > 0 && (
                <ChevronRight size={16} className="mx-2 text-gray-400" />
              )}
              {isLast ? (
                <span
                  className="text-gray-600 dark:text-gray-300 font-medium"
                  itemProp="name"
                  aria-current="page"
                >
                  {index === 0 && <Home size={16} className="inline mr-1" />}
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                  itemProp="item"
                >
                  {index === 0 && <Home size={16} className="mr-1" />}
                  <span itemProp="name">{crumb.label}</span>
                </Link>
              )}
              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
