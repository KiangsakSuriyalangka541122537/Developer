import React, { useState } from 'react';
import { useAppStore, User, Role } from '../store';
import { Users as UsersIcon, Plus, Edit2, Trash2, Save, XCircle, Building2, UserCircle } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

type TabType = 'department' | 'staff';

export default function Users() {
  const { users, addUser, updateUser, deleteUser, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('department');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Custom Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'success' | 'info';
    onConfirm: () => void;
    showCancel?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
    showCancel: true
  });

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
        role: activeTab === 'department' ? 'department' : 'approver',
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
    
    setConfirmModal({
      isOpen: true,
      title: 'สำเร็จ',
      message: 'บันทึกข้อมูลเรียบร้อยแล้ว',
      type: 'success',
      showCancel: false,
      onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      setConfirmModal({
        isOpen: true,
        title: 'แจ้งเตือน',
        message: 'ไม่สามารถลบบัญชีของตนเองได้',
        type: 'danger',
        showCancel: false,
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการลบ',
      message: 'คุณต้องการลบข้อมูลนี้ใช่หรือไม่?',
      type: 'danger',
      showCancel: true,
      onConfirm: async () => {
        await deleteUser(id);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const filteredUsers = users.filter(u => {
    if (activeTab === 'department') return u.role === 'department';
    return u.role !== 'department';
  });

  return (
    <div className="space-y-8 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">หน้าจัดการ</h1>
          <p className="text-slate-500 mt-1">เพิ่ม แก้ไข ลบรายชื่อบุคลากร และกำหนดสิทธิ์การใช้งาน</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md">
          <Plus className="size-5" />
          {activeTab === 'department' ? 'เพิ่มแผนก' : 'เพิ่มผู้ใช้งาน'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('department')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'department' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Building2 className="size-5" />
          จัดการแผนก
        </button>
        <button 
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'staff' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <UserCircle className="size-5" />
          จัดการผู้ใช้งาน
        </button>
      </div>

      <div className="space-y-4">
        {filteredUsers.length > 0 ? filteredUsers.map(user => (
          <div 
            key={user.id} 
            className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                {activeTab === 'department' ? <Building2 className="size-6" /> : <UserCircle className="size-6" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{user.name}</h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <span className="font-medium text-slate-400">Username:</span> {user.username}
                  </span>
                  {activeTab === 'staff' && (
                    <>
                      <span className="text-slate-300">|</span>
                      <span className="text-sm text-slate-500 font-medium">{user.position || 'ไม่มีตำแหน่ง'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
              {activeTab === 'staff' && (
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  user.role === 'approver' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  user.role === 'developer' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {user.role === 'approver' ? 'ผู้อนุมัติงาน' : user.role === 'developer' ? 'ผู้พัฒนาโปรแกรม' : 'แผนก'}
                </span>
              )}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleOpenModal(user)} 
                  className="p-2.5 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all" 
                  title="แก้ไข"
                >
                  <Edit2 className="size-5" />
                </button>
                <button 
                  onClick={() => handleDelete(user.id)} 
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all" 
                  title="ลบ"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
            <UsersIcon className="size-12 mx-auto mb-3 opacity-20" />
            <p className="italic font-medium">ไม่พบข้อมูลในรายการนี้</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-8">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-lg font-bold text-slate-900">
                {editingUser ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูลใหม่'} 
                ({activeTab === 'department' ? 'แผนก' : 'ผู้ใช้งาน'})
              </h4>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">
                    {activeTab === 'department' ? 'ชื่อแผนก' : 'ชื่อ-นามสกุล'} <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                    required
                    placeholder={activeTab === 'department' ? 'เช่น งานเทคโนโลยีสารสนเทศ' : 'เช่น นายสมชาย ใจดี'}
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
                
                {activeTab === 'staff' && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">บทบาท (Role) <span className="text-rose-500">*</span></label>
                      <select 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                        required
                      >
                        <option value="approver">ผู้อนุมัติงาน</option>
                        <option value="developer">ผู้พัฒนาโปรแกรม</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">ตำแหน่ง</label>
                      <input 
                        type="text" 
                        value={formData.position}
                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                        placeholder="เช่น นักวิชาการคอมพิวเตอร์"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'department' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-400 italic">หมายเหตุ: บทบาทจะถูกกำหนดเป็น 'แผนก' โดยอัตโนมัติ</label>
                  </div>
                )}
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

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        showCancel={confirmModal.showCancel}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
