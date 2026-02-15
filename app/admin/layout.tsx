import { AdminSidebar } from '@/components/sidebar';
import '../globals.css';

export const metadata = {
  title: 'Admin - MNP',
  description: "Tableau de bord d'administration des données de conservation",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
