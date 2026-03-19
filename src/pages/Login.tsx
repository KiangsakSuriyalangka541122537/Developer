import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Terminal, Lock, User, Eye, EyeOff, LogIn, Phone } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAppStore();
  const navigate = useNavigate();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus username field on mount
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
    
    // Fallback for some browsers/timing issues
    const timer = setTimeout(() => {
      if (usernameRef.current) {
        usernameRef.current.focus();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleUsernameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (passwordRef.current) {
        passwordRef.current.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      const user = useAppStore.getState().currentUser;
      if (user?.name === 'นายกิตติพงษ์') {
        navigate('/list');
      } else {
        navigate('/');
      }
    } else {
      setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      if (usernameRef.current) {
        usernameRef.current.focus();
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-4 px-4 overflow-hidden">
      <div className="w-full max-w-[480px]">
        <div className="flex flex-col items-center mb-8">
          <div className="size-20 bg-primary/10 flex items-center justify-center mb-6 shadow-sm rounded-[1.5rem]">
            <Terminal className="text-primary size-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ระบบขอพัฒนาโปรแกรม</h1>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/70 border border-slate-100 p-12">
          <h2 className="text-xl font-bold mb-10 text-center text-slate-500 uppercase tracking-wider">เข้าสู่ระบบ</h2>
          
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="flex flex-col gap-2.5">
              <label className="text-base font-bold text-slate-700 ml-1">ชื่อผู้ใช้งาน (Username)</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 size-6 group-focus-within:text-primary transition-colors" />
                <input 
                  ref={usernameRef}
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleUsernameKeyDown}
                  className="w-full pl-14 pr-5 py-4.5 bg-slate-50/50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium text-lg" 
                  placeholder="ระบุชื่อผู้ใช้งาน" 
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-base font-bold text-slate-700 ml-1">รหัสผ่าน (Password)</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 size-6 group-focus-within:text-primary transition-colors" />
                <input 
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-4.5 bg-slate-50/50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium text-lg" 
                  placeholder="ระบุรหัสผ่าน" 
                  required
                />
                <button 
                  type="button" 
                  onClick={() => {
                    setShowPassword(!showPassword);
                    if (passwordRef.current) {
                      passwordRef.current.focus();
                    }
                  }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="size-6" /> : <Eye className="size-6" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-rose-500 text-base text-center font-medium bg-rose-50 p-4 rounded-2xl">
                {error}
              </div>
            )}

            <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-bold py-4.5 rounded-[1.25rem] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/30 mt-8 active:scale-[0.98] text-lg">
              <LogIn className="size-5" />
              เข้าสู่ระบบ
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col items-center">
            <div className="flex items-center gap-3 text-slate-400 hover:text-primary transition-colors">
              <Phone className="size-5" />
              <p className="text-sm font-bold">หากเข้าใช้งานไม่ได้ ติดต่อโทร : 1037</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
