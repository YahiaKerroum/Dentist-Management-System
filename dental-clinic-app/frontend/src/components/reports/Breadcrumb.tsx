import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  items: string[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-4">
      {items.map((item, index) => (
        <span key={item} className="flex items-center">
          {index > 0 && <ChevronRight size={14} className="mx-2 text-gray-300" />}
          <span className={index === items.length - 1 ? 'text-gray-700 font-medium' : 'text-gray-500'}>{item}</span>
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
