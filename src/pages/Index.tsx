
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileSidebar from '@/components/layout/MobileSidebar';

const MainLayout = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      navigate('/auth', { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading || !session) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      {isMobile && <MobileSidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
