import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';
import { Terminal, LogOut, User as UserIcon, Menu, X } from 'lucide-react';

export default function Layout() {
  const { currentUser, logout } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/request', label: 'เขียนคำขอ' },
    { to: '/list', label: 'รายการคำขอ', protected: true },
    { to: '/workload', label: 'ภาระงาน', protected: true, minRole: 'approver' },
    { to: '/users', label: 'หน้าจัดการ', protected: true, minRole: 'approver' },
    { to: '/reports', label: 'ออกรายงาน', protected: true, minRole: 'approver' },
  ];

  const filteredLinks = navLinks.filter(link => {
    if (link.protected && !currentUser) return false;
    if (link.minRole && currentUser && currentUser.role === 'department' && link.minRole !== 'department') {
      // Logic for developers/approvers only
      if (link.to === '/workload' || link.to === '/users' || link.to === '/reports') {
        return currentUser.role !== 'department';
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 py-3 lg:px-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-primary mr-4 shrink-0" onClick={() => setIsMenuOpen(false)}>
            <div className="size-8 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Terminal className="size-5" />
            </div>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight hidden lg:block">ระบบขอพัฒนาโปรแกรม</h2>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight lg:hidden">Request App</h2>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 ml-auto mr-6">
            {filteredLinks.map(link => (
              <Link 
                key={link.to}
                to={link.to} 
                className={`font-medium px-4 py-2 rounded-xl transition-all ${
                  location.pathname === link.to 
                    ? 'text-primary bg-primary/5' 
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center">
                <div className="hidden sm:flex flex-col items-end mr-3 border-r border-slate-200 pr-3">
                  <p className="text-sm font-bold text-slate-900 line-clamp-1">{currentUser.name}</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{currentUser.role === 'department' ? (currentUser.position || 'User') : currentUser.role}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link to="/profile" className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary/10 hover:text-primary transition-colors">
                    <UserIcon className="size-5" />
                  </Link>
                  <button onClick={handleLogout} className="size-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-colors" title="ออกจากระบบ">
                    <LogOut className="size-5" />
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-primary/10">
                เข้าสู่ระบบ
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors ml-1"
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="xl:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col p-4 gap-1">
              {filteredLinks.map(link => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 font-semibold px-4 py-3 rounded-xl transition-all ${
                    location.pathname === link.to 
                      ? 'text-primary bg-primary/5' 
                      : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {currentUser && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between px-4">
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">{currentUser.role}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-rose-600 font-bold text-sm bg-rose-50 px-4 py-2 rounded-lg"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
