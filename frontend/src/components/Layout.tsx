import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Home,
  Briefcase,
  PiggyBank,
  ClipboardCheck,
  Settings,
  LogOut,
  User,
  Plus,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'New Application',
      href: '/application/new',
      icon: Plus,
    },
    {
      name: 'Documents',
      href: '/documents',
      icon: FileText,
    },
    {
      name: 'Property Details',
      href: '/property-details',
      icon: Home,
    },
    {
      name: 'Income & Employment',
      href: '/income-employment',
      icon: Briefcase,
    },
    {
      name: 'Assets & Liabilities',
      href: '/assets-liabilities',
      icon: PiggyBank,
    },
    {
      name: 'Review & Submit',
      href: '/review-submit',
      icon: ClipboardCheck,
    },
    {
      name: 'Application Status',
      href: '/application/status',
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 z-50 flex w-72 flex-col">
        {/* Sidebar content */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-2xl font-bold">Mortgage App</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )
                        }
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="space-y-2">
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      cn(
                        'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )
                    }
                  >
                    <Settings className="h-6 w-6 shrink-0" />
                    Settings
                  </NavLink>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-x-3"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-6 w-6 shrink-0" />
                    Log out
                  </Button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-72">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm">
          <div className="flex flex-1 justify-end gap-x-4 self-stretch">
            <div className="flex items-center gap-x-4">
              <div className="flex items-center gap-x-2">
                <User className="h-6 w-6" />
                <span className="text-sm font-semibold">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 