import React, { useState } from 'react';
import { useAppStore } from '../store';
import { User, Save } from 'lucide-react';

export default function Profile() {
  const { currentUser, updateUser } = useAppStore();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    password: currentUser?.password || ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      await updateUser(currentUser.id, formData);
      setMessage('บันทึกข้อมูลสำเร็จ');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8 overflow-hidden">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">จัดการข้อมูลส่วนตัว</h1>
        <p className="text-slate-500">แก้ไขข้อมูลชื่อและรหัสผ่านของคุณ</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="size-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{currentUser.username}</h2>
            <p className="text-sm text-slate-500 capitalize">{currentUser.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">ชื่อ-นามสกุล / ชื่อแผนก</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg h-12 px-4 bg-white outline-none transition-all" 
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">รหัสผ่านใหม่</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg h-12 px-4 bg-white outline-none transition-all" 
              required 
            />
          </div>

          {message && (
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium text-center">
              {message}
            </div>
          )}

          <div className="pt-4">
            <button type="submit" className="w-full bg-primary hover:bg-secondary rounded-xl h-12 text-white shadow-lg shadow-primary/30 flex items-center justify-center gap-2 font-bold transition-all">
              <Save className="size-5" />
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
