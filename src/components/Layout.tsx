import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';
import { Terminal, LogOut, User as UserIcon, LayoutDashboard, FileText, Users } from 'lucide-react';

export default function Layout() {
  const { currentUser, logout } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 lg:px-10 shadow-sm">
        <Link to="/" className="flex items-center gap-4 text-primary">
          <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Terminal className="text-primary size-5" />
          </div>
          <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight hidden sm:block">ระบบขอพัฒนาโปรแกรม</h2>
        </Link>
        
        <div className="flex flex-1 justify-end gap-6 items-center">
          <nav className="hidden md:flex gap-2">
            <Link to="/" className={`font-medium px-3 py-2 rounded-xl transition-all ${location.pathname === '/' ? 'text-primary bg-primary/5' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}`}>Dashboard</Link>
            {currentUser?.role === 'department' && (
              <Link to="/request" className={`font-medium px-3 py-2 rounded-xl transition-all ${location.pathname === '/request' ? 'text-primary bg-primary/5' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}`}>เขียนคำขอ</Link>
            )}
            {currentUser && (
               <Link to="/list" className={`font-medium px-3 py-2 rounded-xl transition-all ${location.pathname === '/list' ? 'text-primary bg-primary/5' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}`}>รายการคำขอ</Link>
            )}
            {currentUser && currentUser.role !== 'department' && (
               <Link to="/workload" className={`font-medium px-3 py-2 rounded-xl transition-all ${location.pathname === '/workload' ? 'text-primary bg-primary/5' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}`}>ภาระงาน</Link>
            )}
            {currentUser?.role === 'approver' && (
               <Link to="/users" className={`font-medium px-3 py-2 rounded-xl transition-all ${location.pathname === '/users' ? 'text-primary bg-primary/5' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}`}>หน้าจัดการ</Link>
            )}
          </nav>

          {currentUser ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.position || 'แผนก'}</p>
              </div>
              <Link to="/profile" className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                <UserIcon className="size-5" />
              </Link>
              <button onClick={handleLogout} className="size-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-colors ml-2" title="ออกจากระบบ">
                <LogOut className="size-5" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium transition-colors">
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
