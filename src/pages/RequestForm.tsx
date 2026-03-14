import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Save, RefreshCcw, UploadCloud } from 'lucide-react';

export default function RequestForm() {
  const { currentUser, addRequest } = useAppStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    topic: '',
    estimatedUsers: '',
    objective: '',
    currentSystem: '',
    attachmentUrl: '',
    file: null as File | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    addRequest({
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      department: currentUser.name, // Assuming department name is the user's name for department role
      date: new Date().toISOString(),
      topic: formData.topic,
      estimatedUsers: formData.estimatedUsers,
      objective: formData.objective,
      currentSystem: formData.currentSystem,
      attachmentUrl: formData.file ? formData.file.name : formData.attachmentUrl
    });

    navigate('/list');
  };

  const handleReset = () => {
    setFormData({
      topic: '',
      estimatedUsers: '',
      objective: '',
      currentSystem: '',
      attachmentUrl: '',
      file: null
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">แบบฟอร์มขอพัฒนาโปรแกรม</h1>
        <p className="text-slate-500">กรุณากรอกรายละเอียดความต้องการเพื่อให้ทีมพัฒนาตรวจสอบและดำเนินการ</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">ชื่อ-นามสกุล</label>
              <input 
                type="text" 
                value={currentUser?.name || ''} 
                className="bg-slate-50 border-slate-200 rounded-lg h-12 px-4 text-slate-500 cursor-not-allowed outline-none" 
                readOnly 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">วันที่ขอข้อมูล</label>
              <input 
                type="text" 
                value={new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })} 
                className="bg-slate-50 border-slate-200 rounded-lg h-12 px-4 text-slate-500 cursor-not-allowed outline-none" 
                readOnly 
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">แผนก/ฝ่าย</label>
              <input 
                type="text" 
                value={currentUser?.name || ''} 
                className="bg-slate-50 border-slate-200 rounded-lg h-12 px-4 text-slate-500 cursor-not-allowed outline-none" 
                readOnly 
              />
            </div>
          </div>

          <hr className="border-primary/5" />

          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">หัวข้อ/ชื่อโปรแกรมที่ต้องการพัฒนา <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className="border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg h-12 px-4 bg-white outline-none transition-all" 
                placeholder="ระบุชื่อโครงการหรือหัวข้อความต้องการ" 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">จำนวนผู้ใช้งานโดยประมาณ <span className="text-rose-500">*</span></label>
                <select 
                  name="estimatedUsers"
                  value={formData.estimatedUsers}
                  onChange={handleChange}
                  className="border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg h-12 px-4 bg-white outline-none transition-all"
                  required
                >
                  <option value="">เลือกจำนวนผู้ใช้งาน</option>
                  <option value="1-5">1 - 5 คน</option>
                  <option value="6-20">6 - 20 คน</option>
                  <option value="21-50">21 - 50 คน</option>
                  <option value="51+">มากกว่า 50 คน</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">ระบบเดิมที่ใช้งานอยู่ (ถ้ามี)</label>
                <input 
                  type="text" 
                  name="currentSystem"
                  value={formData.currentSystem}
                  onChange={handleChange}
                  className="border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg h-12 px-4 bg-white outline-none transition-all" 
                  placeholder="เช่น Excel, Paper, หรือโปรแกรมเดิม" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">วัตถุประสงค์และความต้องการ <span className="text-rose-500">*</span></label>
              <textarea 
                name="objective"
                value={formData.objective}
                onChange={handleChange}
                className="border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg p-4 bg-white outline-none transition-all" 
                placeholder="อธิบายรายละเอียดความต้องการและปัญหาที่ต้องการแก้ไข..." 
                rows={4}
                required
              ></textarea>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">แนบไฟล์ประกอบ (รูปภาพ, PDF, Word, Excel)</label>
              <label className="border-2 border-dashed border-primary/20 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
                <UploadCloud className="size-10 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <p className="text-slate-700 font-medium">
                    {formData.file ? formData.file.name : 'คลิกเพื่ออัปโหลด หรือลากไฟล์มาวางที่นี่'}
                  </p>
                  <p className="text-xs text-slate-500">รองรับไฟล์ JPG, PNG, PDF, DOCX, XLSX (สูงสุด 10MB)</p>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx" />
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button type="submit" className="bg-primary hover:bg-secondary rounded-xl px-8 py-3 text-white shadow-lg shadow-primary/30 flex items-center justify-center gap-2 font-bold transition-all">
              <Save className="size-5" />
              บันทึกคำขอพัฒนา
            </button>
            <button type="button" onClick={handleReset} className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <RefreshCcw className="size-5" />
              ล้างข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
