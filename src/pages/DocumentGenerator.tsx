import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'motion/react';
import { Printer, FileText, Plus, Trash2, Save, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { DocumentData, DEFAULT_DOCUMENT, Signatory } from '../types';
import { PrintableDocument } from '../components/PrintableDocument';

export default function DocumentGenerator() {
  const [data, setData] = useState<DocumentData>(DEFAULT_DOCUMENT);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Document_${data.subject}`,
  });

  const updateSignatory = (index: number, updates: Partial<Signatory>) => {
    const newSignatories = [...data.signatories];
    newSignatories[index] = { ...newSignatories[index], ...updates };
    setData({ ...data, signatories: newSignatories });
  };

  const addSignatory = () => {
    setData({
      ...data,
      signatories: [...data.signatories, { name: '', position: '', role: '' }]
    });
  };

  const removeSignatory = (index: number) => {
    setData({
      ...data,
      signatories: data.signatories.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-120px)]">
      {/* Left: Form */}
      <div className="lg:w-1/2 flex flex-col gap-6 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">สร้างหนังสือราชการ</h1>
            <p className="text-slate-500">กรอกข้อมูลเพื่อสร้างหนังสือราชการในรูปแบบมาตรฐาน</p>
          </div>
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
          >
            <Printer className="size-5" />
            พิมพ์เอกสาร
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">ประเภทหนังสือ</label>
              <select
                value={data.type}
                onChange={(e) => setData({ ...data, type: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="internal">บันทึกข้อความ (ภายใน)</option>
                <option value="external">หนังสือราชการ (ภายนอก)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">วันที่</label>
              <input
                type="date"
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">ส่วนราชการ</label>
            <input
              type="text"
              value={data.agency}
              onChange={(e) => setData({ ...data, agency: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="เช่น งานเทคโนโลยีสารสนเทศ"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">ที่ (เลขที่หนังสือ)</label>
              <input
                type="text"
                value={data.refNo}
                onChange={(e) => setData({ ...data, refNo: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="เช่น สธ 0000/000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">เรียน</label>
              <input
                type="text"
                value={data.to}
                onChange={(e) => setData({ ...data, to: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="เช่น ผู้อำนวยการ"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">เรื่อง</label>
            <input
              type="text"
              value={data.subject}
              onChange={(e) => setData({ ...data, subject: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">เนื้อหา</label>
            <textarea
              value={data.content}
              onChange={(e) => setData({ ...data, content: e.target.value })}
              rows={8}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">ผู้ลงนาม</h3>
              <button
                onClick={addSignatory}
                className="flex items-center gap-1 text-primary hover:text-secondary text-sm font-bold transition-colors"
              >
                <Plus className="size-4" />
                เพิ่มผู้ลงนาม
              </button>
            </div>
            
            <div className="space-y-4">
              {data.signatories.map((sig, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={index}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 relative group"
                >
                  <button
                    onClick={() => removeSignatory(index)}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={sig.name}
                      onChange={(e) => updateSignatory(index, { name: e.target.value })}
                      placeholder="ชื่อ-นามสกุล"
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-primary transition-all"
                    />
                    <input
                      type="text"
                      value={sig.position}
                      onChange={(e) => updateSignatory(index, { position: e.target.value })}
                      placeholder="ตำแหน่ง"
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <input
                    type="text"
                    value={sig.role || ''}
                    onChange={(e) => updateSignatory(index, { role: e.target.value })}
                    placeholder="บทบาทเพิ่มเติม (ถ้ามี)"
                    className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-primary transition-all"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="lg:w-1/2 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <FileText className="size-5" />
            <span className="font-semibold">ตัวอย่างเอกสาร (A4)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>มาตราส่วน 1:1</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-200/50">
          <div className="shadow-2xl origin-top scale-[0.6] sm:scale-[0.8] md:scale-100">
            <PrintableDocument ref={printRef} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
