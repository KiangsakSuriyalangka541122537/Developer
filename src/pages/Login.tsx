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
    <div className="flex-1 flex items-center justify-center py-12 px-4 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="size-20 bg-primary/10 flex items-center justify-center mb-6 shadow-sm rounded-2xl">
            <Terminal className="text-primary size-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ระบบขอพัฒนาโปรแกรม</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">IT Development Request System</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-10">
          <h2 className="text-2xl font-bold mb-10 text-center text-slate-800">เข้าสู่ระบบ</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">ชื่อผู้ใช้งาน (Username)</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5 group-focus-within:text-primary transition-colors" />
                <input 
                  ref={usernameRef}
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleUsernameKeyDown}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium" 
                  placeholder="ระบุชื่อผู้ใช้งาน" 
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">รหัสผ่าน (Password)</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5 group-focus-within:text-primary transition-colors" />
                <input 
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium" 
                  placeholder="ระบุรหัสผ่าน" 
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-rose-500 text-sm text-center font-medium bg-rose-50 p-2 rounded-lg">
                {error}
              </div>
            )}

            <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/25 mt-6 active:scale-[0.98]">
              <LogIn className="size-5" />
              เข้าสู่ระบบ
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-white px-4 text-slate-300">ช่วยเหลือ</span>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">หากเข้าใช้งานไม่ได้ ติดต่อแอดมิน:</p>
            <div className="flex flex-col items-center gap-2 bg-slate-50/80 p-5 rounded-[1.5rem] border border-slate-100 transition-all hover:bg-slate-50">
              <p className="text-slate-600 font-bold text-sm">กลุ่มงานเทคโนโลยีสารสนเทศ</p>
              <div className="flex items-center gap-2 text-primary">
                <Phone className="size-4" />
                <span className="font-black text-lg tracking-tighter">โทร. 1037</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
