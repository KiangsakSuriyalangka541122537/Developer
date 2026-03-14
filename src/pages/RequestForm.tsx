import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Save, RefreshCcw, UploadCloud } from 'lucide-react';

export default function RequestForm() {
  const { currentUser, addRequest } = useAppStore();
  const navigate = useNavigate();
  
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    requesterName: currentUser?.name || '',
    topic: '',
    estimatedUsers: '',
    objective: '',
    currentSystem: '',
    attachmentUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    await addRequest({
      requesterId: currentUser.id,
      requesterName: formData.requesterName || currentUser.name,
      department: currentUser.name,
      date: new Date().toISOString(),
      topic: formData.topic,
      estimatedUsers: formData.estimatedUsers,
      objective: formData.objective,
      currentSystem: formData.currentSystem,
      attachmentUrl: files.length > 0 ? files.map(f => f.name).join(', ') : formData.attachmentUrl
    });

    navigate('/list');
  };

  const handleReset = () => {
    setFormData({
      requesterName: currentUser?.name || '',
      topic: '',
      estimatedUsers: '',
      objective: '',
      currentSystem: '',
      attachmentUrl: '',
    });
    setFiles([]);
  };

  return (
    <div className="space-y-8 overflow-hidden">
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
                name="requesterName"
                value={formData.requesterName} 
                onChange={handleChange}
                className="bg-white border-slate-200 rounded-lg h-12 px-4 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                placeholder="ระบุชื่อ-นามสกุล"
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
              <label className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer group ${files.length > 0 ? 'border-primary bg-primary/5' : 'border-primary/20 bg-primary/5 hover:bg-primary/10'}`}>
                <UploadCloud className={`size-10 transition-transform ${files.length > 0 ? 'text-primary' : 'text-primary group-hover:scale-110'}`} />
                <div className="text-center">
                  <p className="text-slate-700 font-medium">
                    คลิกเพื่ออัปโหลด หรือลากไฟล์มาวางที่นี่
                  </p>
                  <p className="text-xs text-slate-500 mt-1">รองรับไฟล์ JPG, PNG, PDF, DOCX, XLSX (สูงสุด 10MB)</p>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx" multiple />
              </label>
              
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <span className="text-sm text-slate-500 truncate">{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)} className="text-rose-500 hover:text-rose-700 text-sm font-medium">ลบ</button>
                    </div>
                  ))}
                </div>
              )}
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
