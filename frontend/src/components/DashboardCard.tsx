import type{ LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  description?: string;
  className?: string;
}

export const DashboardCard = ({
  title,
  value,
  icon: Icon,
  iconColor,
  bgColor,
  description,
}: DashboardCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`${bgColor} ${iconColor} p-4 rounded-full`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};