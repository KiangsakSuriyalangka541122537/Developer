import React, { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      navigate('/list');
    } else {
      setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="flex-1 flex items-start justify-center pt-0 -mt-8 md:-mt-12 lg:-mt-16 pb-12">
      <div className="w-full max-w-md p-2 md:p-4">
        <div className="flex flex-col items-center mb-4">
          <div className="size-14 bg-primary/10 flex items-center justify-center mb-2 shadow-sm rounded-xl">
            <Terminal className="text-primary size-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">ระบบขอพัฒนาโปรแกรม</h1>
          <p className="text-slate-500 text-sm mt-0.5">IT Development Request System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-semibold mb-6 text-center">เข้าสู่ระบบ</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">ชื่อผู้ใช้งาน (Username)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-400" 
                  placeholder="ระบุชื่อผู้ใช้งาน" 
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">รหัสผ่าน (Password)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-400" 
                  placeholder="ระบุรหัสผ่าน" 
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
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

            <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 mt-4">
              <LogIn className="size-5" />
              เข้าสู่ระบบ
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">ช่วยเหลือ</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-slate-500 text-sm">หากเข้าใช้งานไม่ได้ ติดต่อแอดมิน:</p>
            <div className="flex flex-col items-center gap-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-slate-700 font-medium text-sm">กลุ่มงานเทคโนโลยีสารสนเทศ</p>
              <div className="flex items-center gap-1 text-primary">
                <Phone className="size-4" />
                <span className="font-bold text-primary">โทร. 1037</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
