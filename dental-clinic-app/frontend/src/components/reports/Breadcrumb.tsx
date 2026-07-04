import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  items: string[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-sm text-surface-500 mb-4">
      {items.map((item, index) => (
        <span key={item} className="flex items-center">
          {index > 0 && <ChevronRight size={14} className="mx-2 text-surface-300" />}
          <span className={index === items.length - 1 ? 'text-surface-700 font-medium' : 'text-surface-500'}>{item}</span>
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
