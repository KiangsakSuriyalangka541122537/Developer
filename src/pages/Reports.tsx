import { useState, useMemo, useRef } from 'react';
import { useAppStore, DevRequest } from '../store';
import { FileText, Download, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';

export default function Reports() {
  const { requests, users, currentUser } = useAppStore();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [developerFilter, setDeveloperFilter] = useState('all');

  const printRef = useRef<HTMLDivElement>(null);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      let match = true;

      if (startDate && req.date < startDate) match = false;
      if (endDate && req.date > endDate) match = false;

      if (statusFilter !== 'all' && req.status !== statusFilter) match = false;

      if (developerFilter !== 'all') {
        if (!req.developerId && developerFilter === 'unassigned') {
          // match assigned unassigned? Wait, I didn't add "unassigned" to options. Let's just match id.
        } else if (req.developerId !== developerFilter) {
          match = false;
        }
      }

      return match;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [requests, startDate, endDate, statusFilter, developerFilter]);

  const exportExcel = () => {
    const data = filteredRequests.map(req => ({
      รหัสคำขอ: req.id,
      วันที่: req.date,
      แผนก: req.department,
      หัวข้อ: req.topic,
      สถานะ: req.status === 'done' ? 'เสร็จสิ้น'
             : req.status === 'in_progress' ? 'กำลังดำเนินการ'
             : req.status === 'accepted' ? 'รับงานแล้ว'
             : req.status === 'rejected' ? 'ถูกปฏิเสธ'
             : 'รอรับงาน',
      ผู้พัฒนา: users.find(u => u.id === req.developerId)?.name || 'ยังไม่ระบุ'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, "Report.xlsx");
  };

  const exportPDF = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Reports'
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <FileText className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ออกรายงาน</h1>
          <p className="text-slate-500">เรียกดูและส่งออกรายงานข้อมูลคำขอ</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">ตั้งแต่</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg h-10 px-3 bg-white outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">ถึง</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg h-10 px-3 bg-white outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">สถานะ</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg h-10 px-3 bg-white outline-none"
            >
              <option value="all">คำขอทั้งหมด</option>
              <option value="pending">รอรับงาน</option>
              <option value="accepted">รับงานแล้ว</option>
              <option value="in_progress">กำลังดำเนินการ</option>
              <option value="done">เสร็จสิ้น</option>
              <option value="rejected">ถูกปฏิเสธ</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">ผู้พัฒนา</label>
            <select 
              value={developerFilter}
              onChange={(e) => setDeveloperFilter(e.target.value)}
              className="border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg h-10 px-3 bg-white outline-none"
            >
              <option value="all">ทั้งหมด</option>
              {users.filter(u => u.role === 'developer').map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button 
            onClick={exportPDF}
            className="flex items-center justify-center gap-2 h-10 px-4 bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium rounded-xl transition-colors"
          >
            <Printer className="size-4" />
            <span>Export PDF</span>
          </button>
          <button 
            onClick={exportExcel}
            className="flex items-center justify-center gap-2 h-10 px-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-medium rounded-xl transition-colors"
          >
            <Download className="size-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      <div ref={printRef} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4">
        {/* We add a print-only header so when someone exports as PDF it includes a printed header */}
        <div className="hidden print:block mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">รายงานข้อมูลคำขอ</h2>
          <p className="text-slate-600">
            {startDate ? `ตั้งแต่วันที่ ${new Date(startDate).toLocaleDateString('th-TH')}` : ''}
            {endDate ? ` ถึงวันที่ ${new Date(endDate).toLocaleDateString('th-TH')}` : ''}
            {!startDate && !endDate ? 'รายงานทั้งหมด' : ''}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 text-sm font-semibold text-slate-900 whitespace-nowrap">ID / วันที่</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-900">แผนก</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-900">หัวข้อ</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-900">สถานะ</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-900">ผู้พัฒนา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <p className="font-medium text-slate-900">{req.id}</p>
                    <p className="text-xs text-slate-500">{new Date(req.date).toLocaleDateString('th-TH')}</p>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700">{req.department}</td>
                  <td className="py-4 px-6 text-slate-600 max-w-sm truncate">{req.topic}</td>
                  <td className="py-4 px-6">
                    {req.status === 'done' ? <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">เสร็จสิ้น</span>
                     : req.status === 'in_progress' ? <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">กำลังดำเนินการ</span>
                     : req.status === 'accepted' ? <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">รับงานแล้ว</span>
                     : req.status === 'rejected' ? <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-medium">ถูกปฏิเสธ</span>
                     : <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">รอรับงาน</span>}
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-slate-700">
                    {users.find(u => u.id === req.developerId)?.name || '-'}
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
