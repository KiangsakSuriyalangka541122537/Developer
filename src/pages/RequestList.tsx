import { useState } from 'react';
import { useAppStore, DevRequest } from '../store';
import { FileText, Edit, Trash2, CheckCircle, XCircle, Forward, UserCheck, Eye, Calendar, MailOpen } from 'lucide-react';

export default function RequestList() {
  const { currentUser, requests, updateRequest, deleteRequest, users } = useAppStore();
  const [selectedReq, setSelectedReq] = useState<DevRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDevId, setSelectedDevId] = useState('');
  const [editFormData, setEditFormData] = useState({
    topic: '',
    estimatedUsers: '',
    objective: '',
    currentSystem: ''
  });

  const developers = users.filter(u => u.role === 'developer');

  // Filter requests based on role
  let visibleRequests = requests;
  if (currentUser?.role === 'department') {
    visibleRequests = requests.filter(r => r.requesterId === currentUser.id);
  } else if (currentUser?.role === 'developer') {
    visibleRequests = requests.filter(r => r.developerId === currentUser.id || r.status === 'accepted'); // Can see accepted to take them
  }

  const handleDelete = async (id: string, status: string) => {
    if (currentUser?.role === 'department' && status !== 'pending') {
      alert('ไม่สามารถลบคำขอที่ถูกรับงานไปแล้วได้');
      return;
    }
    if (window.confirm('คุณต้องการลบคำขอนี้ใช่หรือไม่?')) {
      await deleteRequest(id);
    }
  };

  const handleReject = async () => {
    if (selectedReq && rejectReason) {
      await updateRequest(selectedReq.id, { status: 'rejected', rejectionReason: rejectReason });
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedReq(null);
    }
  };

  const handleDone = async () => {
    if (selectedReq && projectLink) {
      await updateRequest(selectedReq.id, { status: 'done', projectLink });
      setShowDoneModal(false);
      setProjectLink('');
      setSelectedReq(null);
    }
  };

  const handleAssign = async () => {
    if (selectedReq && selectedDevId) {
      await updateRequest(selectedReq.id, { status: 'accepted', developerId: selectedDevId });
      setShowAssignModal(false);
      setSelectedDevId('');
      setSelectedReq(null);
    }
  };

  const handleEdit = async () => {
    if (selectedReq) {
      await updateRequest(selectedReq.id, editFormData);
      setShowEditModal(false);
      setSelectedReq(null);
    }
  };

  const handleReassign = async () => {
    if (selectedReq && selectedDevId) {
      await updateRequest(selectedReq.id, { developerId: selectedDevId });
      setShowAssignModal(false);
      setSelectedDevId('');
      setSelectedReq(null);
    }
  };

  const handleDevAccept = async (req: DevRequest) => {
    await updateRequest(req.id, { status: 'in_progress', developerId: currentUser?.id });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string, color: string }> = {
      pending: { label: 'รออนุมัติ', color: 'status-pending' },
      accepted: { label: 'รับงาน', color: 'status-accepted' },
      in_progress: { label: 'กำลังดำเนินการ', color: 'status-inprogress' },
      done: { label: 'เสร็จสิ้น', color: 'status-done' },
      rejected: { label: 'ปฏิเสธ', color: 'status-rejected' }
    };
    const b = badges[status];
    return <span className={`inline-flex items-center justify-center w-28 py-1 rounded-full text-xs font-medium border ${b.color}`}>{b.label}</span>;
  };

  return (
    <div className="space-y-8 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">รายการคำขอพัฒนาโปรแกรม</h1>
          <p className="text-slate-500 mt-1">ติดตามและจัดการคำขอพัฒนาซอฟต์แวร์</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-sm font-medium border-b border-slate-100 bg-slate-50">
                <th className="py-4 pl-6">ลำดับ</th>
                <th className="py-4">ชื่อโครงการ</th>
                <th className="py-4">แผนก</th>
                <th className="py-4">วันที่ขอ</th>
                <th className="py-4">สถานะ</th>
                <th className="py-4 text-right pr-6">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {visibleRequests.map((req, index) => (
                <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-4 pl-6 font-medium">{index + 1}</td>
                  <td className="py-4">{req.topic}</td>
                  <td className="py-4">{req.department}</td>
                  <td className="py-4">{new Date(req.date).toLocaleDateString('th-TH')}</td>
                  <td className="py-4">
                    <button onClick={() => { setSelectedReq(req); setShowDetailsModal(true); }} className="hover:opacity-80 transition-opacity">
                      {getStatusBadge(req.status)}
                    </button>
                  </td>
                  <td className="py-4 text-right pr-6">
                    <div className="flex justify-end items-center">
                      {/* Slot 1: View */}
                      <div className="w-10 flex justify-center">
                        <button onClick={() => { setSelectedReq(req); setShowDetailsModal(true); }} className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="ดูรายละเอียด">
                          <Eye className="size-5" />
                        </button>
                      </div>

                      {/* Slot 2: Primary Action (Edit / Assign / Accept / Done) */}
                      <div className="w-10 flex justify-center">
                        {currentUser?.role === 'department' && req.status === 'pending' && (
                          <button 
                            onClick={() => { 
                              setSelectedReq(req); 
                              setEditFormData({
                                topic: req.topic,
                                estimatedUsers: req.estimatedUsers,
                                objective: req.objective,
                                currentSystem: req.currentSystem || ''
                              });
                              setShowEditModal(true); 
                            }} 
                            className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors" 
                            title="แก้ไขคำขอ"
                          >
                            <Edit className="size-5" />
                          </button>
                        )}
                        {currentUser?.role === 'approver' && req.status === 'pending' && (
                          <button onClick={() => { setSelectedReq(req); setShowAssignModal(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="มอบหมายงาน">
                            <MailOpen className="size-5" />
                          </button>
                        )}
                        {currentUser?.role === 'developer' && (
                          <>
                            {req.status === 'accepted' && (
                              <button onClick={() => handleDevAccept(req)} className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors" title="รับงาน">
                                <UserCheck className="size-5" />
                              </button>
                            )}
                            {req.status === 'in_progress' && req.developerId === currentUser.id && (
                              <button onClick={() => { setSelectedReq(req); setShowDoneModal(true); }} className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors" title="เสร็จสิ้น">
                                <CheckCircle className="size-5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Slot 3: Secondary Action (Delete / Forward) */}
                      <div className="w-10 flex justify-center">
                        {(currentUser?.role === 'department' || currentUser?.role === 'approver') && (
                          <button onClick={() => handleDelete(req.id, req.status)} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors" title="ลบคำขอ">
                            <Trash2 className="size-5" />
                          </button>
                        )}
                        {currentUser?.role === 'developer' && (req.status === 'accepted' || req.status === 'in_progress') && (
                          <button onClick={() => { setSelectedReq(req); setShowAssignModal(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="ส่งต่องาน">
                            <Forward className="size-5" />
                          </button>
                        )}
                      </div>

                      {/* Slot 4: Reject Action */}
                      <div className="w-10 flex justify-center">
                        {currentUser?.role === 'approver' && req.status !== 'done' && req.status !== 'rejected' && (
                           <button onClick={() => { setSelectedReq(req); setShowRejectModal(true); }} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors" title="ปฏิเสธ">
                             <XCircle className="size-5" />
                           </button>
                        )}
                        {currentUser?.role === 'developer' && (req.status === 'accepted' || req.status === 'in_progress') && (
                          <button onClick={() => { setSelectedReq(req); setShowRejectModal(true); }} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors" title="ปฏิเสธ">
                            <XCircle className="size-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">ไม่มีข้อมูลคำขอ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-lg font-bold text-slate-900">ระบุเหตุผลการปฏิเสธ</h4>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="size-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">เหตุผลประกอบการพิจารณา</label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                  placeholder="กรุณาระบุรายละเอียดที่ต้องแก้ไข หรือเหตุผลที่ไม่สามารถดำเนินการได้..." 
                  rows={4}
                ></textarea>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowRejectModal(false)} className="px-5 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition-all">ยกเลิก</button>
              <button onClick={handleReject} disabled={!rejectReason} className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all disabled:opacity-50">ยืนยันการปฏิเสธ</button>
            </div>
          </div>
        </div>
      )}

      {/* Done Modal */}
      {showDoneModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-lg font-bold text-slate-900">ยืนยันการเสร็จสิ้นโครงการ</h4>
              <button onClick={() => setShowDoneModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="size-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">ลิงก์โปรแกรม / คู่มือการใช้งาน</label>
                <input 
                  type="url"
                  value={projectLink}
                  onChange={(e) => setProjectLink(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                  placeholder="https://..." 
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowDoneModal(false)} className="px-5 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition-all">ยกเลิก</button>
              <button onClick={handleDone} disabled={!projectLink} className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50">ยืนยันส่งงาน</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-lg font-bold text-slate-900">มอบหมายงาน</h4>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="size-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">เลือกผู้พัฒนาโปรแกรม</label>
                <select 
                  value={selectedDevId}
                  onChange={(e) => setSelectedDevId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                >
                  <option value="">-- เลือกผู้พัฒนา --</option>
                  {developers.map(dev => (
                    <option key={dev.id} value={dev.id}>{dev.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowAssignModal(false)} className="px-5 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition-all">ยกเลิก</button>
              <button onClick={currentUser?.role === 'developer' ? handleReassign : handleAssign} disabled={!selectedDevId} className="px-5 py-2 rounded-lg bg-primary hover:bg-secondary text-white font-bold transition-all disabled:opacity-50">มอบหมาย</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-lg font-bold text-slate-900">แก้ไขคำขอพัฒนาโปรแกรม</h4>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="size-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">หัวข้อ/ชื่อโปรแกรม <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={editFormData.topic}
                  onChange={(e) => setEditFormData({...editFormData, topic: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">จำนวนผู้ใช้งานโดยประมาณ <span className="text-rose-500">*</span></label>
                <select 
                  value={editFormData.estimatedUsers}
                  onChange={(e) => setEditFormData({...editFormData, estimatedUsers: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
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
                <label className="text-sm font-semibold text-slate-700">ระบบเดิมที่ใช้งานอยู่ (ถ้ามี)</label>
                <input 
                  type="text" 
                  value={editFormData.currentSystem}
                  onChange={(e) => setEditFormData({...editFormData, currentSystem: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">วัตถุประสงค์และความต้องการ <span className="text-rose-500">*</span></label>
                <textarea 
                  value={editFormData.objective}
                  onChange={(e) => setEditFormData({...editFormData, objective: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                  rows={4}
                  required
                ></textarea>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-5 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition-all">ยกเลิก</button>
              <button 
                onClick={handleEdit} 
                disabled={!editFormData.topic || !editFormData.estimatedUsers || !editFormData.objective} 
                className="px-5 py-2 rounded-lg bg-primary hover:bg-secondary text-white font-bold transition-all disabled:opacity-50"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-8">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-full flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h4 className="text-lg font-bold text-slate-900">รายละเอียดคำขอ {selectedReq.id}</h4>
              <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="size-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 pb-32">
              <div className="flex justify-between items-center">
                {getStatusBadge(selectedReq.status)}
                <span className="text-sm text-slate-500">วันที่ขอ: {new Date(selectedReq.date).toLocaleDateString('th-TH')}</span>
              </div>
              
              <div>
                <h5 className="text-sm font-bold text-slate-500 mb-1">หัวข้อ/ชื่อโปรแกรม</h5>
                <p className="text-slate-900 font-medium text-lg">{selectedReq.topic}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-bold text-slate-500 mb-1">แผนกผู้ขอ</h5>
                  <p className="text-slate-900">{selectedReq.department}</p>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-500 mb-1">ผู้ขอ</h5>
                  <p className="text-slate-900">{selectedReq.requesterName}</p>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-500 mb-1">จำนวนผู้ใช้งาน</h5>
                  <p className="text-slate-900">{selectedReq.estimatedUsers}</p>
                </div>
                {selectedReq.developerId && (
                  <div>
                    <h5 className="text-sm font-bold text-slate-500 mb-1">ผู้รับผิดชอบ (Developer)</h5>
                    <p className="text-slate-900 font-semibold text-primary">{users.find(u => u.id === selectedReq.developerId)?.name}</p>
                  </div>
                )}
              </div>

              <div>
                <h5 className="text-sm font-bold text-slate-500 mb-1">วัตถุประสงค์และความต้องการ</h5>
                <div className="bg-slate-50 p-4 rounded-xl text-slate-700 whitespace-pre-wrap border border-slate-100">
                  {selectedReq.objective}
                </div>
              </div>

              {selectedReq.currentSystem && (
                <div>
                  <h5 className="text-sm font-bold text-slate-500 mb-1">ระบบเดิมที่ใช้งานอยู่</h5>
                  <p className="text-slate-900">{selectedReq.currentSystem}</p>
                </div>
              )}

              {selectedReq.rejectionReason && (
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                  <h5 className="text-sm font-bold text-rose-700 mb-1">เหตุผลที่ปฏิเสธ</h5>
                  <p className="text-rose-600">{selectedReq.rejectionReason}</p>
                </div>
              )}

              {selectedReq.projectLink && (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <h5 className="text-sm font-bold text-emerald-700 mb-1">ลิงก์โปรแกรม / คู่มือ</h5>
                  <a href={selectedReq.projectLink} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline font-medium break-all flex items-center gap-2">
                    <FileText className="size-4" />
                    {selectedReq.projectLink}
                  </a>
                </div>
              )}

              {/* Developer Time Estimation */}
              {(selectedReq.status === 'accepted' || selectedReq.status === 'in_progress' || selectedReq.status === 'done') && (currentUser?.role === 'developer' || currentUser?.role === 'approver') && (
                <div className="border-t border-slate-100 pt-6">
                  <h5 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar className="size-5 text-primary" />
                    กำหนดการพัฒนา
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-600">เริ่มพัฒนา (เดือน/ปี)</label>
                      <input 
                        type="month" 
                        value={selectedReq.startMonthYear || ''}
                        onChange={(e) => updateRequest(selectedReq.id, { startMonthYear: e.target.value })}
                        disabled={currentUser?.role !== 'developer'}
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm disabled:bg-slate-50 disabled:text-slate-400 transition-all cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-600">คาดว่าเสร็จ (เดือน/ปี)</label>
                      <input 
                        type="month" 
                        value={selectedReq.expectedFinishMonthYear || ''}
                        onChange={(e) => updateRequest(selectedReq.id, { expectedFinishMonthYear: e.target.value })}
                        disabled={currentUser?.role !== 'developer'}
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm disabled:bg-slate-50 disabled:text-slate-400 transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end">
              <button onClick={() => setShowDetailsModal(false)} className="px-5 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
