import React, { useState } from 'react';
import { useAppStore, DevRequest } from '../store';
import { FileText, Edit, Trash2, Eye, Calendar, Download, RefreshCw, X, MailOpen, UserCheck, CheckCircle, XCircle, Forward } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { supabase } from '../lib/supabase';

export default function RequestList() {
  const { requests, users, currentUser, deleteRequest, updateRequest } = useAppStore();
  const [selectedReq, setSelectedReq] = useState<DevRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [assignData, setAssignData] = useState({
    developerId: ''
  });
  const [editData, setEditData] = useState<Partial<DevRequest>>({});

  // Filter requests: Department sees only their own, others see all
  const visibleRequests = currentUser?.role === 'department' 
    ? requests.filter(r => r.department === currentUser?.name)
    : requests;

  const handleEditSubmit = async () => {
    if (!selectedReq) return;
    try {
      await updateRequest(selectedReq.id, editData);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating request:', error);
      alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    }
  };

  const handleDownloadAll = async (attachmentUrl: string, requestId: string, department: string, date: string) => {
    if (!attachmentUrl) return;
    
    try {
      let attachments: { name: string, url: string }[] = [];
      try {
        const parsed = JSON.parse(attachmentUrl);
        if (Array.isArray(parsed)) {
          attachments = parsed;
        } else if (typeof parsed === 'object' && parsed.url) {
          attachments = [parsed];
        }
      } catch (e) {
        const parts = attachmentUrl.split(',').map(p => p.trim()).filter(p => p);
        attachments = parts.map(p => {
          if (p.startsWith('http')) {
            return { name: p.split('/').pop()?.split('?')[0] || 'file', url: p };
          } else {
            const path = p.startsWith('attachments/') ? p : `attachments/${p}`;
            const { data: { publicUrl } } = supabase.storage.from('Dev-attachments').getPublicUrl(path);
            return { name: p.split('/').pop() || p, url: publicUrl };
          }
        });
      }

      if (attachments.length === 0) return;

      const zip = new JSZip();
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear() + 543; 
      const formattedDate = `${day}-${month}-${year}`;

      const folderName = `attachments-${department}-${formattedDate}-${requestId}`;
      const folder = zip.folder(folderName);

      const downloadPromises = attachments.map(async (file) => {
        try {
          const urlParts = file.url.split('Dev-attachments/');
          if (urlParts.length > 1) {
            const path = decodeURIComponent(urlParts[1].split('?')[0]);
            const { data, error } = await supabase.storage.from('Dev-attachments').download(path);
            if (!error && data) {
              folder?.file(file.name, data);
              return;
            }
          }
          const response = await fetch(file.url);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const blob = await response.blob();
          folder?.file(file.name, blob);
        } catch (err) {
          console.error(`Failed to download file ${file.name}:`, err);
        }
      });

      await Promise.all(downloadPromises);
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
    const b = badges[status] || { label: status, color: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex items-center justify-center w-28 py-1 rounded-full text-xs font-bold border uppercase tracking-tighter ${b.color}`}>{b.label}</span>;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณต้องการลบคำขอนี้ใช่หรือไม่?')) {
      try {
        await deleteRequest(id);
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('เกิดข้อผิดพลาดในการลบคำขอ');
      }
    }
  };

  return (
    <div className="space-y-8 overflow-hidden">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">รายการคำขอ</h1>
        <p className="text-slate-500 mt-1">ติดตามและจัดการคำขอพัฒนาซอฟต์แวร์ของแผนกคุณ</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-sm font-medium border-b border-slate-100 bg-slate-50">
                <th className="py-4 pl-8 w-20 text-center">ลำดับ</th>
                <th className="py-4 px-6">ชื่อโครงการ</th>
                <th className="py-4 px-6">วันที่ขอ</th>
                <th className="py-4 px-6">ผู้พัฒนา</th>
                <th className="py-4 px-6 text-center">สถานะ</th>
                <th className="py-4 px-6 text-center w-40">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {visibleRequests.map((req, index) => (
                <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-4 pl-8 text-center font-bold text-slate-400">{index + 1}</td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900">{req.topic}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-600">{new Date(req.date).toLocaleDateString('th-TH')}</td>
                  <td className="py-4 px-6 text-slate-600">
                    {req.developerId ? users.find(u => u.id === req.developerId)?.name : '-'}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center">
                      <div className="grid grid-cols-4 gap-1 w-fit">
                        {/* Slot 1: View */}
                        <div className="flex justify-center w-8">
                          <button 
                            onClick={() => { setSelectedReq(req); setShowDetailsModal(true); }}
                            className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="size-5" />
                          </button>
                        </div>

                        {/* Slot 2: Edit */}
                        <div className="flex justify-center w-8">
                          {currentUser?.role === 'approver' && (
                            <button 
                              onClick={() => { 
                                setSelectedReq(req); 
                                setEditData({
                                  topic: req.topic,
                                  objective: req.objective,
                                  estimatedUsers: req.estimatedUsers,
                                  currentSystem: req.currentSystem,
                                  userGroup: req.userGroup,
                                  departmentPhone: req.departmentPhone
                                });
                                setShowEditModal(true); 
                              }}
                              className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors"
                              title="แก้ไขข้อมูล"
                            >
                              <Edit className="size-5" />
                            </button>
                          )}
                        </div>

                        {/* Slot 3: Assign or Download */}
                        <div className="flex justify-center w-8">
                          {currentUser?.role === 'approver' && req.status === 'pending' ? (
                            <button 
                              onClick={() => { 
                                setSelectedReq(req); 
                                setAssignData({
                                  developerId: ''
                                });
                                setShowAssignModal(true); 
                              }} 
                              className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" 
                              title="มอบหมายงาน"
                            >
                              <MailOpen className="size-5" />
                            </button>
                          ) : (
                            req.attachmentUrl && (
                              <button 
                                onClick={() => handleDownloadAll(req.attachmentUrl!, req.id, req.department, req.date)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="ดาวน์โหลดไฟล์แนบ"
                              >
                                <Download className="size-5" />
                              </button>
                            )
                          )}
                        </div>

                        {/* Slot 4: Reject or Delete */}
                        <div className="flex justify-center w-8">
                          {currentUser?.role === 'approver' && req.status === 'pending' ? (
                            <button 
                              onClick={() => { 
                                setSelectedReq(req); 
                                setRejectReason('');
                                setShowRejectModal(true); 
                              }} 
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors" 
                              title="ปฏิเสธคำขอ"
                            >
                              <XCircle className="size-5" />
                            </button>
                          ) : (
                            req.status === 'pending' && currentUser?.role === 'department' && (
                              <button 
                                onClick={() => handleDelete(req.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                                title="ลบคำขอ"
                              >
                                <Trash2 className="size-5" />
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 italic">ไม่พบรายการคำขอ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <FileText className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">รายละเอียดคำขอ</h3>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="size-6 text-slate-500" />
              </button>
            </div>
            
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ชื่อโครงการ</label>
                    <p className="text-lg font-bold text-slate-900 mt-1">{selectedReq.topic}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">วัตถุประสงค์</label>
                    <p className="text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap">{selectedReq.objective}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">แผนกที่ขอ</label>
                      <p className="font-bold text-slate-900 mt-1">{selectedReq.department}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">วันที่ขอ</label>
                      <p className="font-bold text-slate-900 mt-1">{new Date(selectedReq.date).toLocaleDateString('th-TH')}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">สถานะปัจจุบัน</label>
                    <div className="mt-2">{getStatusBadge(selectedReq.status)}</div>
                  </div>
                  {selectedReq.rejectionReason && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                      <label className="text-xs font-bold text-rose-400 uppercase tracking-wider">เหตุผลที่ปฏิเสธ</label>
                      <p className="text-rose-700 mt-1 font-medium">{selectedReq.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-sm"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">มอบหมายงาน</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="size-6 text-slate-500" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">เลือกผู้พัฒนา</label>
                <select 
                  value={assignData.developerId}
                  onChange={(e) => setAssignData({...assignData, developerId: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                >
                  <option value="">-- เลือกผู้พัฒนา --</option>
                  {users.filter(u => u.role === 'developer').map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowAssignModal(false)} className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-all">ยกเลิก</button>
              <button 
                onClick={async () => {
                  if (!assignData.developerId) return;
                  await updateRequest(selectedReq.id, {
                    status: 'accepted',
                    developerId: assignData.developerId
                  });
                  setShowAssignModal(false);
                }}
                disabled={!assignData.developerId}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-secondary text-white font-bold transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                ยืนยันการมอบหมาย
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">ปฏิเสธคำขอ</h3>
              <button onClick={() => setShowRejectModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="size-6 text-slate-500" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-sm text-slate-600">กรุณาระบุเหตุผลในการปฏิเสธคำขอพัฒนาโปรแกรมนี้</p>
              <textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="ระบุเหตุผล..."
                className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm min-h-[120px]"
              />
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowRejectModal(false)} className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-all">ยกเลิก</button>
              <button 
                onClick={async () => {
                  if (!rejectReason.trim()) return;
                  await updateRequest(selectedReq.id, {
                    status: 'rejected',
                    rejectionReason: rejectReason
                  });
                  setShowRejectModal(false);
                }}
                disabled={!rejectReason.trim()}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all disabled:opacity-50 shadow-lg shadow-rose-600/20"
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">แก้ไขข้อมูลคำขอ</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="size-6 text-slate-500" />
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">หัวข้อ/ชื่อโปรแกรม</label>
                  <input 
                    type="text"
                    value={editData.topic || ''}
                    onChange={(e) => setEditData({...editData, topic: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">กลุ่มผู้ใช้งาน</label>
                  <input 
                    type="text"
                    value={editData.userGroup || ''}
                    onChange={(e) => setEditData({...editData, userGroup: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">จำนวนผู้ใช้งานโดยประมาณ</label>
                  <select 
                    value={editData.estimatedUsers || ''}
                    onChange={(e) => setEditData({...editData, estimatedUsers: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                  >
                    <option value="1 - 5 คน">1 - 5 คน</option>
                    <option value="6 - 10 คน">6 - 10 คน</option>
                    <option value="11 - 20 คน">11 - 20 คน</option>
                    <option value="21 - 50 คน">21 - 50 คน</option>
                    <option value="มากกว่า 50 คน">มากกว่า 50 คน</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">เบอร์โทรศัพท์แผนก</label>
                  <input 
                    type="text"
                    value={editData.departmentPhone || ''}
                    onChange={(e) => setEditData({...editData, departmentPhone: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">ระบบเดิมที่ใช้งานอยู่ (ถ้ามี)</label>
                <input 
                  type="text"
                  value={editData.currentSystem || ''}
                  onChange={(e) => setEditData({...editData, currentSystem: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">วัตถุประสงค์และความต้องการ</label>
                <textarea 
                  value={editData.objective || ''}
                  onChange={(e) => setEditData({...editData, objective: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm min-h-[120px]"
                />
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-all">ยกเลิก</button>
              <button 
                onClick={handleEditSubmit}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-secondary text-white font-bold transition-all shadow-lg shadow-primary/20"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
