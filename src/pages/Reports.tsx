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
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
            .print-container {
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
              width: 100% !important;
            }
            table {
              width: 100% !important;
              table-layout: fixed !important;
              border-collapse: collapse !important;
            }
            th, td {
              word-wrap: break-word !important;
              white-space: normal !important;
              padding: 8px 4px !important;
              font-size: 10pt !important;
              border-bottom: 1px solid #e2e8f0 !important;
            }
            /* Hide columns prefix on print for more space if needed, 
               but here we adjust widths instead */
            thead {
              display: table-header-group;
            }
            tr {
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      <div className="flex items-center gap-3 no-print">
        <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <FileText className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ออกรายงาน</h1>
          <p className="text-slate-500">เรียกดูและส่งออกรายงานข้อมูลคำขอ</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 no-print">
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

      <div ref={printRef} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 print-container">
        {/* We add a print-only header so when someone exports as PDF it includes a printed header */}
        <div className="hidden print:block mb-8 text-center border-b-2 border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">รายงานข้อมูลคำขอรับบริการพัฒนาโปรแกรม</h2>
          <p className="text-slate-600 font-medium">
            {startDate ? `จากวันที่ ${new Date(startDate).toLocaleDateString('th-TH')}` : ''}
            {endDate ? ` ถึงวันที่ ${new Date(endDate).toLocaleDateString('th-TH')}` : ''}
            {!startDate && !endDate ? 'รายการข้อมูลทั้งหมด' : ''}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">พิมพ์โดย: {currentUser?.name} | วันที่พิมพ์: {new Date().toLocaleString('th-TH')}</p>
        </div>
        
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left border-collapse print:table-fixed">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 text-sm font-semibold text-slate-900 whitespace-nowrap print:w-[18%]">ID / วันที่</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-900 print:w-[15%]">แผนก</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-900 print:w-[32%]">หัวข้อ</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-900 print:w-[15%]">สถานะ</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-900 print:w-[20%]">ผู้พัฒนา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900 text-xs print:text-[10pt]">{req.id}</p>
                    <p className="text-xs text-slate-500">{new Date(req.date).toLocaleDateString('th-TH')}</p>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700 text-xs print:text-[10pt]">{req.department}</td>
                  <td className="py-4 px-6 text-slate-600 text-xs print:text-[10pt] break-words whitespace-normal leading-relaxed">
                    {req.topic}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap print:border print:px-2
                      ${req.status === 'done' ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                       : req.status === 'in_progress' ? 'bg-amber-100 text-amber-700 border-amber-200'
                       : req.status === 'accepted' ? 'bg-blue-100 text-blue-700 border-blue-200'
                       : req.status === 'rejected' ? 'bg-rose-100 text-rose-700 border-rose-200'
                       : 'bg-slate-100 text-slate-700 border-slate-200'}`}
                    >
                      {req.status === 'done' ? 'เสร็จสิ้น'
                       : req.status === 'in_progress' ? 'กำลังดำเนินการ'
                       : req.status === 'accepted' ? 'รับงานแล้ว'
                       : req.status === 'rejected' ? 'ถูกปฏิเสธ'
                       : 'รอรับงาน'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs print:text-[10pt] font-medium text-slate-700">
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
