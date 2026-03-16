import React, { useState } from 'react';
import { useAppStore, DevRequest } from '../store';
import { BarChart, Users, CheckCircle, Clock, Briefcase, Lock, Trophy, Filter, Eye, XCircle, FileText, Download, Calendar, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { requests, users, currentUser, updateRequest } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedReq, setSelectedReq] = useState<DevRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditingRemark, setIsEditingRemark] = useState(false);
  const [tempRemark, setTempRemark] = useState('');

  const visibleRequests = requests;

  const stats = {
    total: visibleRequests.length,
    pending: visibleRequests.filter(r => r.status === 'pending').length,
    inProgress: visibleRequests.filter(r => r.status === 'in_progress').length,
    done: visibleRequests.filter(r => r.status === 'done').length,
  };

  const developers = users.filter(u => u.role === 'developer');
  const developerWorkload = developers.map(dev => {
    const devRequests = requests.filter(r => r.developerId === dev.id);
    return {
      ...dev,
      accepted: devRequests.filter(r => r.status === 'accepted').length,
      inProgress: devRequests.filter(r => r.status === 'in_progress').length,
      done: devRequests.filter(r => r.status === 'done').length,
    };
  });

  const filteredRequests = filterStatus 
    ? visibleRequests.filter(r => r.status === filterStatus)
    : visibleRequests;

  const toggleFilter = (status: string | null) => {
    if (filterStatus === status) {
      setFilterStatus(null);
    } else {
      setFilterStatus(status);
    }
  };

  const handleUpdateRemark = async () => {
    if (!selectedReq) return;
    try {
      await updateRequest(selectedReq.id, {
        developerRemark: tempRemark
      });
      setIsEditingRemark(false);
      // Update local selectedReq to reflect change
      setSelectedReq({ ...selectedReq, developerRemark: tempRemark });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadAll = async (attachmentUrl: string, requestId: string, department: string, date: string) => {
    if (!attachmentUrl) return;
    
    try {
      let attachments: { name: string, url: string }[] = [];
      
      // 1. Try to parse as JSON
      try {
        const parsed = JSON.parse(attachmentUrl);
        if (Array.isArray(parsed)) {
          attachments = parsed;
        } else if (typeof parsed === 'object' && parsed.url) {
          attachments = [parsed];
        } else if (typeof parsed === 'string') {
          throw new Error('String JSON');
        }
      } catch (e) {
        // 2. Not JSON array, handle as comma-separated or single string
        const parts = attachmentUrl.split(',').map(p => p.trim()).filter(p => p);
        attachments = parts.map(p => {
          if (p.startsWith('http')) {
            return { name: p.split('/').pop()?.split('?')[0] || 'file', url: p };
          } else {
            // If it's just a filename, try to get public URL from Supabase
            // Check if it already has 'attachments/' prefix
            const path = p.startsWith('attachments/') ? p : `attachments/${p}`;
            const { data: { publicUrl } } = supabase.storage.from('Dev-attachments').getPublicUrl(path);
            return { name: p.split('/').pop() || p, url: publicUrl };
          }
        });
      }

      if (attachments.length === 0) return;

      // Always use ZIP or direct Blob download to avoid "white screen" navigation issues
      const zip = new JSZip();
      
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear() + 543; 
      const formattedDate = `${day}-${month}-${year}`;

      const folderName = `attachments-${department}-${formattedDate}-${requestId}`;
      const folder = zip.folder(folderName);

      const downloadPromises = attachments.map(async (file: { name: string, url: string }) => {
        try {
          // Try to download using Supabase SDK first (better for CORS)
          const urlParts = file.url.split('Dev-attachments/');
          if (urlParts.length > 1) {
            const path = decodeURIComponent(urlParts[1].split('?')[0]);
            const { data, error } = await supabase.storage.from('Dev-attachments').download(path);
            if (!error && data) {
              folder?.file(file.name, data);
              return;
            }
          }
          
          // Fallback to fetch if SDK fails or URL format is different
          const response = await fetch(file.url);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const blob = await response.blob();
          folder?.file(file.name, blob);
        } catch (err) {
          console.error(`Failed to download file ${file.name}:`, err);
        }
      });

      await Promise.all(downloadPromises);
      
      // If only one file was successfully added to the folder, we could just save that one
      // but generating a ZIP is more consistent for the user experience.
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `attachments-${department}-${formattedDate}.zip`);
    } catch (error) {
      console.error('Error creating zip:', error);
      alert('เกิดข้อผิดพลาดในการรวมไฟล์ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string, color: string }> = {
      pending: { label: 'รออนุมัติ', color: 'status-pending' },
      accepted: { label: 'รอรับงาน', color: 'status-accepted' },
      in_progress: { label: 'กำลังดำเนินการ', color: 'status-inprogress' },
      done: { label: 'เสร็จสิ้น', color: 'status-done' },
      rejected: { label: 'ปฏิเสธ', color: 'status-rejected' }
    };
    const b = badges[status];
    return <span className={`inline-flex items-center justify-center w-24 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${b.color}`}>{b.label}</span>;
  };

  return (
    <div className="space-y-8 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">ภาพรวมสถานะการขอพัฒนาโปรแกรม</p>
        </div>
        {filterStatus && (
          <button 
            onClick={() => setFilterStatus(null)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all self-start sm:self-center"
          >
            <Filter className="size-4" />
            ล้างการกรอง
          </button>
        )}
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setFilterStatus(null)}
            className={`bg-white p-6 rounded-2xl border transition-all flex flex-col gap-2 text-left group ${!filterStatus ? 'border-primary ring-2 ring-primary/10 shadow-md' : 'border-slate-200 shadow-sm hover:border-primary/30'}`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-bold text-sm ${!filterStatus ? 'text-primary' : 'text-slate-500'}`}>คำขอทั้งหมด</span>
              <div className={`size-8 rounded-lg flex items-center justify-center transition-colors ${!filterStatus ? 'bg-primary text-white' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'}`}>
                <BarChart className="size-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          </button>

          <button 
            onClick={() => toggleFilter('pending')}
            className={`bg-white p-6 rounded-2xl border transition-all flex flex-col gap-2 text-left group ${filterStatus === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/10 shadow-md' : 'border-slate-200 shadow-sm hover:border-amber-300'}`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-bold text-sm ${filterStatus === 'pending' ? 'text-amber-600' : 'text-slate-500'}`}>รออนุมัติ</span>
              <div className={`size-8 rounded-lg flex items-center justify-center transition-colors ${filterStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600 group-hover:bg-amber-200'}`}>
                <Clock className="size-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
          </button>

          <button 
            onClick={() => toggleFilter('in_progress')}
            className={`bg-white p-6 rounded-2xl border transition-all flex flex-col gap-2 text-left group ${filterStatus === 'in_progress' ? 'border-primary ring-2 ring-primary/10 shadow-md' : 'border-slate-200 shadow-sm hover:border-primary/30'}`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-bold text-sm ${filterStatus === 'in_progress' ? 'text-primary' : 'text-slate-500'}`}>กำลังดำเนินการ</span>
              <div className={`size-8 rounded-lg flex items-center justify-center transition-colors ${filterStatus === 'in_progress' ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:bg-primary/20'}`}>
                <Users className="size-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.inProgress}</p>
          </button>

          <button 
            onClick={() => toggleFilter('done')}
            className={`bg-white p-6 rounded-2xl border transition-all flex flex-col gap-2 text-left group ${filterStatus === 'done' ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-md' : 'border-slate-200 shadow-sm hover:border-emerald-300'}`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-bold text-sm ${filterStatus === 'done' ? 'text-emerald-600' : 'text-slate-500'}`}>เสร็จสิ้น</span>
              <div className={`size-8 rounded-lg flex items-center justify-center transition-colors ${filterStatus === 'done' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200'}`}>
                <CheckCircle className="size-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.done}</p>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <h3 className="font-bold text-lg text-slate-900">
              รายการคำขอ{filterStatus === 'pending' && 'รออนุมัติ'}
              {filterStatus === 'in_progress' && 'กำลังดำเนินการ'}
              {filterStatus === 'done' && 'เสร็จสิ้น'}
              {!filterStatus && 'ทั้งหมด'}
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full">
              {filteredRequests.length} รายการ
            </span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-xs font-bold border-b border-slate-100 bg-slate-50/50 uppercase tracking-wider">
                  <th className="py-4 pl-8 w-16 text-center">ลำดับ</th>
                  <th className="py-4 px-6">ชื่อโครงการ</th>
                  <th className="py-4 px-6">แผนก</th>
                  <th className="py-4 px-6">วันที่ขอ</th>
                  <th className="py-4 px-6">ผู้พัฒนา</th>
                  <th className="py-4 px-6 text-center">ไฟล์แนบ</th>
                  <th className="py-4 pr-8 text-center w-32">สถานะ</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredRequests.map((req, index) => {
                  const isMyRequest = currentUser?.role === 'department' ? req.department === currentUser.name : false;
                  
                  return (
                    <tr 
                      key={req.id} 
                      className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => { setSelectedReq(req); setShowDetailsModal(true); }}
                    >
                      <td className="py-4 pl-8 text-center font-bold text-slate-400 group-hover:text-primary transition-colors">{index + 1}</td>
                      <td className="py-4 px-6 text-slate-700">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 font-bold">
                            {req.topic}
                            {isMyRequest && (
                              <div className="size-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" title="งานของแผนกคุณ" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{req.department}</td>
                      <td className="py-4 px-6 text-slate-500 font-medium">{new Date(req.date).toLocaleDateString('th-TH')}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {req.developerId ? (
                          <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold text-slate-600">
                            {users.find(u => u.id === req.developerId)?.name.replace(/^(นาย|นางสาว|นาง|ดร\.)\s?/, '').split(' ')[0] || '-'}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {req.attachmentUrl && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadAll(req.attachmentUrl!, req.id, req.department, req.date);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="ดาวน์โหลดเอกสารแนบ"
                          >
                            <Download className="size-5" />
                          </button>
                        )}
                      </td>
                      <td className="py-4 pr-8 text-center">
                        {getStatusBadge(req.status)}
                      </td>
                    </tr>
                  );
                })}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-24 text-center text-slate-400 font-medium italic">
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="size-8 text-slate-200" />
                        <span>ไม่พบข้อมูลคำขอที่ตรงตามเงื่อนไข</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Details Modal */}
      {showDetailsModal && selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-8">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-full flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h4 className="text-xl font-black text-slate-900">รายละเอียดคำขอ</h4>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setIsEditingRemark(false);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all text-sm border border-slate-200"
                >
                  ปิด
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 pb-6 scrollbar-hide">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedReq.status)}
                </div>
                <span className="text-sm font-medium text-slate-500">วันที่ขอ: {new Date(selectedReq.date).toLocaleDateString('th-TH')}</span>
              </div>
              
              <div>
                <h5 className="text-base font-bold text-slate-500 mb-2">หัวข้อ/ชื่อโปรแกรม</h5>
                <p className="text-black font-normal text-xl">{selectedReq.topic}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <h5 className="text-base font-bold text-slate-500 mb-2">แผนกผู้ขอ</h5>
                  <p className="text-black font-normal text-base">{selectedReq.department}</p>
                </div>
                <div>
                  <h5 className="text-base font-bold text-slate-500 mb-2">ผู้ขอ</h5>
                  <p className="text-black font-normal text-base">{selectedReq.requesterName}</p>
                </div>
                <div>
                  <h5 className="text-base font-bold text-slate-500 mb-2">จำนวนผู้ใช้งาน</h5>
                  <p className="text-black font-normal text-base">{selectedReq.estimatedUsers}</p>
                </div>
                <div>
                  <h5 className="text-base font-bold text-slate-500 mb-2">กลุ่มผู้ใช้งาน</h5>
                  <p className="text-black font-normal text-base">{selectedReq.userGroup || '-'}</p>
                </div>
                <div>
                  <h5 className="text-base font-bold text-slate-500 mb-2">เบอร์โทรแผนก</h5>
                  <p className="text-black font-normal text-base">{selectedReq.departmentPhone || '-'}</p>
                </div>
                {selectedReq.developerId && (
                  <div>
                    <h5 className="text-base font-bold text-slate-500 mb-2">ผู้รับผิดชอบ (Developer)</h5>
                    <p className="text-black font-normal text-base">{users.find(u => u.id === selectedReq.developerId)?.name}</p>
                  </div>
                )}
                {selectedReq.previousDeveloperId && (
                  <div>
                    <h5 className="text-base font-bold text-orange-500 mb-2">ผู้พัฒนาเดิม (เคสต่อเนื่อง)</h5>
                    <p className="text-black font-bold text-base">{users.find(u => u.id === selectedReq.previousDeveloperId)?.name || 'ไม่พบข้อมูล'}</p>
                  </div>
                )}
              </div>

              {(selectedReq.developerRemark || currentUser?.role === 'developer' || currentUser?.role === 'approver') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-base font-bold text-slate-500">หมายเหตุจากผู้พัฒนา</h5>
                    {(currentUser?.role === 'developer' || currentUser?.role === 'approver') && !isEditingRemark && (
                      <button 
                        onClick={() => {
                          setIsEditingRemark(true);
                          setTempRemark(selectedReq.developerRemark || '');
                        }}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="size-3" />
                        แก้ไขหมายเหตุ
                      </button>
                    )}
                  </div>
                  
                  {isEditingRemark ? (
                    <div className="space-y-3">
                      <textarea 
                        value={tempRemark}
                        onChange={(e) => setTempRemark(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm min-h-[100px]"
                        placeholder="ระบุหมายเหตุเพิ่มเติม..."
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setIsEditingRemark(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                        >
                          ยกเลิก
                        </button>
                        <button 
                          onClick={handleUpdateRemark}
                          className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 flex items-center gap-1"
                        >
                          <Save className="size-3" />
                          บันทึกหมายเหตุ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50/50 p-4 rounded-xl text-black font-normal border border-blue-100 italic">
                      {selectedReq.developerRemark || <span className="text-slate-400">ไม่มีหมายเหตุ</span>}
                    </div>
                  )}
                </div>
              )}

              <div>
                <h5 className="text-base font-bold text-slate-500 mb-2">วัตถุประสงค์และความต้องการ</h5>
                <div className="bg-slate-50/80 p-4 rounded-xl text-black font-normal whitespace-pre-wrap">
                  {selectedReq.objective}
                </div>
              </div>

              {selectedReq.currentSystem && (
                <div>
                  <h5 className="text-base font-bold text-slate-500 mb-2">ระบบเดิมที่ใช้งานอยู่</h5>
                  <p className="text-black font-normal text-base">{selectedReq.currentSystem}</p>
                </div>
              )}
              
              {selectedReq.attachmentUrl && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-base font-bold text-slate-500">เอกสารแนบ</h5>
                    {(() => {
                      try {
                        const attachments = JSON.parse(selectedReq.attachmentUrl);
                        if (Array.isArray(attachments) && attachments.length > 1) {
                          return (
                            <button 
                              onClick={() => handleDownloadAll(selectedReq.attachmentUrl!, selectedReq.id, selectedReq.department, selectedReq.date)}
                              className="text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm border border-emerald-200 active:scale-95"
                            >
                              <Download className="size-3.5" />
                              ดาวน์โหลดทั้งหมด (ZIP)
                            </button>
                          );
                        }
                      } catch (e) { return null; }
                    })()}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(() => {
                      try {
                        const attachments = JSON.parse(selectedReq.attachmentUrl);
                        if (Array.isArray(attachments)) {
                          return attachments.map((file: { name: string, url: string }, idx: number) => (
                            <a 
                              key={idx}
                              href={file.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group shadow-sm"
                              title={file.name}
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600 group-hover:bg-emerald-200 transition-colors">
                                  <FileText className="size-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-600 truncate group-hover:text-emerald-700 transition-colors">
                                  {file.name}
                                </span>
                              </div>
                              <Download className="size-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                            </a>
                          ));
                        }
                      } catch (e) {
                        return (
                          <a 
                            href={selectedReq.attachmentUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group shadow-sm w-full"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600 group-hover:bg-emerald-200 transition-colors">
                                <FileText className="size-4" />
                              </div>
                              <span className="text-xs font-bold text-slate-600 truncate group-hover:text-emerald-700 transition-colors">
                                เปิดดูหรือดาวน์โหลดเอกสาร
                              </span>
                            </div>
                            <Download className="size-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                          </a>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}

              {selectedReq.rejectionReason && (
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                  <h5 className="text-base font-bold text-rose-700 mb-2">เหตุผลที่ปฏิเสธ</h5>
                  <p className="text-black font-normal">{selectedReq.rejectionReason}</p>
                </div>
              )}

              {selectedReq.projectLink && (
                <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
                  <h5 className="text-base font-bold text-emerald-700 mb-2">ลิงก์โปรแกรม / คู่มือ</h5>
                  <a 
                    href={selectedReq.projectLink.startsWith('http') ? selectedReq.projectLink : `https://${selectedReq.projectLink}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-black hover:underline font-normal break-all flex items-center gap-2 text-base"
                  >
                    <FileText className="size-5" />
                    {selectedReq.projectLink}
                  </a>
                </div>
              )}

              {/* Developer Time Estimation */}
              {(selectedReq.status === 'accepted' || selectedReq.status === 'in_progress' || selectedReq.status === 'done') && (selectedReq.startMonthYear || selectedReq.expectedFinishMonthYear) && (
                <div className="border-t border-slate-100 pt-6">
                  <h5 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar className="size-5 text-primary" />
                    กำหนดการพัฒนา
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {selectedReq.startMonthYear && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-400 uppercase">เริ่มพัฒนา</span>
                        <span className="text-sm font-bold text-slate-700">
                          {(() => {
                            const [y, m] = selectedReq.startMonthYear.split('-');
                            const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                            return `${THAI_MONTHS[parseInt(m)-1]} ${parseInt(y)+543}`;
                          })()}
                        </span>
                      </div>
                    )}
                    {selectedReq.expectedFinishMonthYear && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-400 uppercase">คาดว่าเสร็จ</span>
                        <span className="text-sm font-bold text-slate-700">
                          {(() => {
                            const [y, m] = selectedReq.expectedFinishMonthYear.split('-');
                            const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                            return `${THAI_MONTHS[parseInt(m)-1]} ${parseInt(y)+543}`;
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                  {selectedReq.startMonthYear && selectedReq.expectedFinishMonthYear && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-500">ระยะเวลาดำเนินการรวม:</span>
                      <span className="text-sm font-black text-primary">
                        {(() => {
                          const [y1, m1] = selectedReq.startMonthYear.split('-').map(Number);
                          const [y2, m2] = selectedReq.expectedFinishMonthYear.split('-').map(Number);
                          const diff = (y2 - y1) * 12 + (m2 - m1) + 1;
                          return diff > 0 ? `${diff} เดือน` : 'ข้อมูลไม่ถูกต้อง';
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Actions */}
              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
