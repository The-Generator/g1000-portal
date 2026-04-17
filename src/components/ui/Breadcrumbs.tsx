import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  className?: string;
}

/**
 * Simple breadcrumb trail for inner pages. Pass an array of items in order
 * (excluding the home icon). The last item is rendered as the current page.
 */
export function Breadcrumbs({ items, homeHref = '/', className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm text-gray-600 ${className}`}>
      <ol className="flex items-center flex-wrap gap-y-1">
        <li className="flex items-center">
          <Link
            href={homeHref}
            className="inline-flex items-center hover:text-generator-dark transition-colors"
            aria-label="Home"
          >
            <HomeIcon className="w-4 h-4" />
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              <ChevronRightIcon className="w-4 h-4 mx-1.5 text-gray-400 flex-shrink-0" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-generator-dark transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'text-generator-dark font-semibold' : 'text-gray-600'}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
