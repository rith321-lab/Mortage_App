import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Home,
  Briefcase,
  PiggyBank,
  ClipboardCheck,
  Settings
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
  { name: 'Documents', href: 'documents', icon: FileText },
  { name: 'Property Details', href: 'property-details', icon: Home },
  { name: 'Income & Employment', href: 'income-employment', icon: Briefcase },
  { name: 'Assets & Liabilities', href: 'assets-liabilities', icon: PiggyBank },
  { name: 'Review & Submit', href: 'review-submit', icon: ClipboardCheck },
  { name: 'Settings', href: 'settings', icon: Settings }
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Mortgage Application</h2>
      </div>
      <nav className="p-2 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
} 