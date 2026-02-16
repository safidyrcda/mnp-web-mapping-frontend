'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, FolderOpen, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    {
      href: '/admin/funders',
      icon: Users,
      label: 'Bailleurs',
    },
    // {
    //   href: '/admin/projects',
    //   icon: FolderOpen,
    //   label: 'Projets',
    // },
    {
      href: '/admin/fundings',
      icon: Banknote,
      label: 'Financements',
    },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-sidebar-primary">
          Madagascar National Parks
        </h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">
          Gestion des données
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
