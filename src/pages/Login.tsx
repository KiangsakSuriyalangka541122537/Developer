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
      navigate('/');
    } else {
      setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-4 px-4 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-4">
          <div className="size-14 bg-primary/10 flex items-center justify-center mb-3 shadow-sm rounded-2xl">
            <Terminal className="text-primary size-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ระบบขอพัฒนาโปรแกรม</h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">IT Development Request System</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <h2 className="text-xl font-bold mb-6 text-center text-slate-800">เข้าสู่ระบบ</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">ชื่อผู้ใช้งาน (Username)</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 group-focus-within:text-primary transition-colors" />
                <input 
                  ref={usernameRef}
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleUsernameKeyDown}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium text-sm" 
                  placeholder="ระบุชื่อผู้ใช้งาน" 
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">รหัสผ่าน (Password)</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 group-focus-within:text-primary transition-colors" />
                <input 
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium text-sm" 
                  placeholder="ระบุรหัสผ่าน" 
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-rose-500 text-xs text-center font-medium bg-rose-50 p-2 rounded-lg">
                {error}
              </div>
            )}

            <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 mt-4 active:scale-[0.98] text-sm">
              <LogIn className="size-4" />
              เข้าสู่ระบบ
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-50 flex flex-col items-center">
            <div className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
              <Phone className="size-3.5" />
              <p className="text-[11px] font-bold">หากเข้าใช้งานไม่ได้ ติดต่อโทร : 1037</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
