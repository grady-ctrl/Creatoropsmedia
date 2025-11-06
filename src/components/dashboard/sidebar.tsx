'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Radio,
  Users,
  GitBranch,
  DollarSign,
  UserPlus,
  LifeBuoy,
  Shield,
  Settings,
  Sparkles,
} from 'lucide-react';
import type { User } from 'next-auth';
import type { Role } from '@prisma/client';

interface SidebarProps {
  user: User & { role: Role };
}

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
  { name: 'Live Ops', href: '/dashboard/live-ops', icon: Radio, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Creators', href: '/dashboard/creators', icon: Users, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Onboarding', href: '/dashboard/onboarding', icon: GitBranch, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Payouts', href: '/dashboard/payouts', icon: DollarSign, roles: ['ADMIN', 'FINANCE', 'MANAGER'] },
  { name: 'Referrals', href: '/dashboard/referrals', icon: UserPlus, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Support', href: '/dashboard/support', icon: LifeBuoy, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Compliance', href: '/dashboard/compliance', icon: Shield, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN'] },
];

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const userNav = navigation.filter(item => item.roles.includes(user.role));

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-background">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-6 border-b">
          <Sparkles className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-lg font-bold">Creator Ops</h1>
            <p className="text-xs text-muted-foreground">Division</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {userNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="flex-shrink-0 border-t p-4">
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold">Logged in as</p>
            <p className="truncate">{user.email}</p>
            <p className="mt-1 text-xs bg-primary/10 text-primary inline-block px-2 py-0.5 rounded">
              {user.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
