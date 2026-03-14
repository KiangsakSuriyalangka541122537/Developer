import React, { useState } from 'react';
import { useAppStore, User, Role } from '../store';
import { Users as UsersIcon, Plus, Edit2, Trash2, Save, XCircle } from 'lucide-react';

export default function Users() {
  const { users, addUser, updateUser, deleteUser, currentUser } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'department' as Role,
    name: '',
    position: ''
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: user.password || '',
        role: user.role,
        name: user.name,
        position: user.position || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        role: 'department',
        name: '',
        position: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      await updateUser(editingUser.id, formData);
    } else {
      await addUser(formData);
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      alert('ไม่สามารถลบบัญชีของตนเองได้');
      return;
    }
    if (window.confirm('คุณต้องการลบบุคลากรนี้ใช่หรือไม่?')) {
      await deleteUser(id);
    }
  };

  return (
    <div className="space-y-8 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">จัดการบุคลากรและสิทธิ์</h1>
          <p className="text-slate-500 mt-1">เพิ่ม แก้ไข ลบรายชื่อบุคลากร และกำหนดสิทธิ์การใช้งาน</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md">
          <Plus className="size-5" />
          เพิ่มบุคลากร
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-sm font-medium border-b border-slate-100 bg-slate-50">
                <th className="py-4 pl-6">ชื่อ-นามสกุล / แผนก</th>
                <th className="py-4">ชื่อผู้ใช้งาน (Username)</th>
                <th className="py-4">บทบาท (Role)</th>
                <th className="py-4">ตำแหน่ง</th>
                <th className="py-4 text-right pr-6">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map(user => (
                <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-4 pl-6 font-medium text-slate-900">{user.name}</td>
                  <td className="py-4 text-slate-500">{user.username}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'approver' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'developer' ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {user.role === 'approver' ? 'ผู้อนุมัติงาน' : user.role === 'developer' ? 'ผู้พัฒนาโปรแกรม' : 'แผนก'}
                    </span>
                  </td>
                  <td className="py-4 text-slate-500">{user.position || '-'}</td>
                  <td className="py-4 text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(user)} className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="แก้ไข">
                        <Edit2 className="size-5" />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors" title="ลบ">
                        <Trash2 className="size-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-8">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-lg font-bold text-slate-900">{editingUser ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มบุคลากรใหม่'}</h4>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">ชื่อ-นามสกุล / ชื่อแผนก <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">ชื่อผู้ใช้งาน (Username) <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">รหัสผ่าน (Password) <span className="text-rose-500">*</span></label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">บทบาท (Role) <span className="text-rose-500">*</span></label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                    required
                  >
                    <option value="department">แผนก</option>
                    <option value="approver">ผู้อนุมัติงาน</option>
                    <option value="developer">ผู้พัฒนาโปรแกรม</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">ตำแหน่ง (ถ้ามี)</label>
                  <input 
                    type="text" 
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition-all">ยกเลิก</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-primary hover:bg-secondary text-white font-bold transition-all flex items-center gap-2">
                  <Save className="size-4" />
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
