import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:ml-28 px-6 sm:px-8 lg:px-12 py-8 max-w-[1400px] mx-auto">
        <Topbar userName={session.user.name || 'Usuário'} />
        {children}
      </div>
    </div>
  );
}
