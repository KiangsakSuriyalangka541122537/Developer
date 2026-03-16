import { useState, useEffect, ChangeEvent } from 'react';
import { useAppStore, DevRequest } from '../store';
import { FileText, Edit, Trash2, CheckCircle, XCircle, Forward, UserCheck, Eye, Calendar, MailOpen, ChevronLeft, ChevronRight, UploadCloud, Download, RefreshCw, Save, Clock } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { supabase } from '../lib/supabase';

const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

function ThaiMonthPicker({ value, onChange, disabled, label, minDate }: { 
  value: string; 
  onChange: (val: string) => void; 
  disabled?: boolean;
  label: string;
  minDate?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    if (value && value.includes('-')) {
      const year = parseInt(value.split('-')[0]);
      if (!isNaN(year)) return year;
    }
    return new Date().getFullYear();
  });
  
  const currentYear = value && value.includes('-') ? parseInt(value.split('-')[0]) : -1;
  const currentMonth = value && value.includes('-') ? parseInt(value.split('-')[1]) - 1 : -1;

  const isMonthDisabled = (monthIndex: number) => {
    if (!minDate || !minDate.includes('-')) return false;
    const [minYear, minMonth] = minDate.split('-').map(Number);
    if (viewYear < minYear) return true;
    if (viewYear === minYear && monthIndex < minMonth - 1) return true;
    return false;
  };

  const handleMonthSelect = (monthIndex: number) => {
    if (isMonthDisabled(monthIndex)) return;
    const formattedMonth = (monthIndex + 1).toString().padStart(2, '0');
    onChange(`${viewYear}-${formattedMonth}`);
    setIsOpen(false);
  };

  const displayValue = (() => {
    if (!value || !value.includes('-')) return 'เลือกเดือน';
    const parts = value.split('-');
    const year = parseInt(parts[0]);
    const monthIndex = parseInt(parts[1]) - 1;
    if (isNaN(year) || isNaN(monthIndex) || !THAI_MONTHS[monthIndex]) return 'เลือกเดือน';
    return `${THAI_MONTHS[monthIndex]} ${year + 543}`;
  })();

  return (
    <div className="relative flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold text-slate-600">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl border border-slate-200 p-3 text-left outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400 flex justify-between items-center transition-all cursor-pointer"
      >
        <span className={(!value || !value.includes('-')) ? 'text-slate-400' : 'text-slate-900'}>{displayValue}</span>
        <Calendar className="size-4 text-slate-400" />
      </button>

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-[105]" onClick={() => setIsOpen(false)}></div>
          <div className="absolute bottom-full left-0 mb-2 z-[110] bg-white border border-slate-200 rounded-2xl shadow-xl p-4 w-64 animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <button type="button" onClick={() => setViewYear(viewYear - 1)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronLeft className="size-4" />
              </button>
              <span className="font-bold text-slate-900">{viewYear + 543}</span>
              <button type="button" onClick={() => setViewYear(viewYear + 1)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {THAI_MONTHS.map((month, index) => {
                const disabled = isMonthDisabled(index);
                return (
                  <button
                    key={month}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleMonthSelect(index)}
                    className={`py-2 text-xs rounded-lg transition-all ${
                      currentMonth === index && currentYear === viewYear
                        ? 'bg-primary text-white font-bold'
                        : disabled
                        ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function RequestList() {
  const { currentUser, requests, updateRequest, deleteRequest, users, addRequest } = useAppStore();
  const [selectedReq, setSelectedReq] = useState<DevRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleStartMonth, setScheduleStartMonth] = useState('');
  const [scheduleEndMonth, setScheduleEndMonth] = useState('');
  const [selectedDevId, setSelectedDevId] = useState('');
  const [revisionFiles, setRevisionFiles] = useState<File[]>([]);
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    topic: '',
    userGroup: '',
    departmentPhone: '',
    estimatedUsers: '',
    objective: '',
    currentSystem: ''
  });
  const [revisionFormData, setRevisionFormData] = useState({
    topic: '',
    objective: '',
  });

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
    type: 'info',
    onConfirm: () => {},
    showCancel: true
  });

  const developers = users.filter(u => u.role === 'developer');

  // Filter requests based on role
  const visibleRequests = currentUser?.role === 'department' 
    ? requests.filter(r => r.department === currentUser.name)
    : requests;

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
      
      // Format date for filename (DD-MM-YYYY)
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear() + 543; // Thai Year
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

  const handleDelete = async (id: string, status: string) => {
    if (currentUser?.role === 'department' && status !== 'pending') {
      setConfirmModal({
        isOpen: true,
        title: 'ไม่สามารถดำเนินการได้',
        message: 'ไม่สามารถลบคำขอที่ถูกรอรับงานไปแล้วได้',
        type: 'warning',
        showCancel: false,
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการลบ',
      message: 'คุณต้องการลบคำขอนี้ใช่หรือไม่?',
      type: 'danger',
      showCancel: true,
      onConfirm: async () => {
        await deleteRequest(id);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
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
      setIsUploading(true);
      try {
        let finalAttachmentUrl = selectedReq.attachmentUrl || '';
        
        if (editFiles.length > 0) {
          const uploadPromises = editFiles.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `attachments/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('Dev-attachments')
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('Dev-attachments')
              .getPublicUrl(filePath);

            return { name: file.name, url: publicUrl };
          });

          const uploadedFiles = await Promise.all(uploadPromises);
          
          let currentFiles: any[] = [];
          if (finalAttachmentUrl) {
            try {
              currentFiles = JSON.parse(finalAttachmentUrl);
              if (!Array.isArray(currentFiles)) currentFiles = [];
            } catch (e) {
              // If it's not a JSON array, treat it as a single URL
              currentFiles = [{ name: 'ไฟล์แนบเดิม', url: finalAttachmentUrl }];
            }
          }
          
          finalAttachmentUrl = JSON.stringify([...currentFiles, ...uploadedFiles]);
        }

        await updateRequest(selectedReq.id, { 
          ...editFormData, 
          attachmentUrl: finalAttachmentUrl 
        });
        
        setShowEditModal(false);
        setSelectedReq(null);
        setEditFiles([]);
      } catch (error) {
        console.error('Error updating request:', error);
        alert('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleReassign = async () => {
    if (selectedReq && selectedDevId) {
      if (selectedReq.developerId !== currentUser?.id) {
        setConfirmModal({
          isOpen: true,
          title: 'ไม่สามารถดำเนินการได้',
          message: 'คุณไม่ใช่ผู้ที่ได้รับมอบหมายงานนี้ จึงไม่สามารถส่งต่องานได้',
          type: 'warning',
          showCancel: false,
          onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
        });
        return;
      }
      await updateRequest(selectedReq.id, { developerId: selectedDevId });
      setShowAssignModal(false);
      setSelectedDevId('');
      setSelectedReq(null);
    }
  };

   const handleDevAccept = async (req: DevRequest) => {
    if (req.developerId !== currentUser?.id) {
      setConfirmModal({
        isOpen: true,
        title: 'ไม่สามารถดำเนินการได้',
        message: 'คุณไม่ใช่ผู้ที่ได้รับมอบหมายงานนี้',
        type: 'warning',
        showCancel: false,
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }
    setSelectedReq(req);
    setScheduleStartMonth('');
    setScheduleEndMonth('');
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async () => {
    if (!selectedReq || !scheduleStartMonth || !scheduleEndMonth) {
      setConfirmModal({
        isOpen: true,
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณาระบุช่วงเวลาการพัฒนาให้ครบถ้วน',
        type: 'warning',
        showCancel: false,
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }
    await updateRequest(selectedReq.id, { 
      status: 'in_progress', 
      developerId: currentUser?.id,
      startMonthYear: scheduleStartMonth,
      expectedFinishMonthYear: scheduleEndMonth
    });
    setShowScheduleModal(false);
    setSelectedReq(null);
    setScheduleStartMonth('');
    setScheduleEndMonth('');
  };

  const handleRevisionSubmit = async () => {
    if (!selectedReq || !currentUser) return;

    // Prevent duplicate submissions
    const alreadyExists = requests.some(r => 
      (r.sourceRequestId === selectedReq.id || r.topic.trim() === `[แก้ไข/เพิ่มเติม] ${selectedReq.topic.trim()}`) && 
      r.status !== 'rejected'
    );

    if (alreadyExists) {
      alert('มีการส่งคำขอแก้ไขสำหรับรายการนี้ไปแล้ว หรือกำลังรอการอนุมัติ');
      return;
    }

    setIsUploading(true);

    try {
      let attachmentUrl = '';
      if (revisionFiles.length > 0) {
        const uploadPromises = revisionFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          const filePath = `attachments/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('Dev-attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('Dev-attachments')
            .getPublicUrl(filePath);

          return { name: file.name, url: publicUrl };
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        attachmentUrl = JSON.stringify(uploadedFiles);
      }

      await addRequest({
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        department: currentUser.name,
        date: new Date().toISOString(),
        topic: revisionFormData.topic,
        userGroup: selectedReq.userGroup,
        departmentPhone: selectedReq.departmentPhone,
        estimatedUsers: selectedReq.estimatedUsers,
        objective: revisionFormData.objective,
        currentSystem: selectedReq.topic, // Reference original topic as current system context
        attachmentUrl: attachmentUrl,
        previousDeveloperId: selectedReq.developerId,
        sourceRequestId: selectedReq.id
      });

      setShowRevisionModal(false);
      setRevisionFiles([]);
      setRevisionFormData({ topic: '', objective: '' });
      setSelectedReq(null);
      
      setConfirmModal({
        isOpen: true,
        title: 'สำเร็จ',
        message: 'ส่งคำขอแก้ไข/เพิ่มเติมเรียบร้อยแล้ว',
        type: 'success',
        showCancel: false,
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
    } catch (error) {
      console.error('Error submitting revision:', error);
      alert('เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRevisionFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setRevisionFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeRevisionFile = (index: number) => {
    setRevisionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setEditFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeEditFile = (index: number) => {
    setEditFiles(prev => prev.filter((_, i) => i !== index));
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
    return <span className={`inline-flex items-center justify-center w-28 py-1 rounded-full text-xs font-medium border ${b.color}`}>{b.label}</span>;
  };

  return (
    <div className="space-y-8 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">รายการคำขอ</h1>
          <p className="text-slate-500 mt-1">ติดตามและจัดการคำขอพัฒนาซอฟต์แวร์</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-sm font-medium border-b border-slate-100 bg-slate-50">
                <th className="py-4 pl-12 w-20">ลำดับ</th>
                <th className="py-4 px-6 w-1/4">ชื่อโครงการ</th>
                <th className="py-4 px-6">แผนก</th>
                <th className="py-4 px-6">วันที่ขอ</th>
                <th className="py-4 px-6">ผู้พัฒนา</th>
                <th className="py-4 px-6 text-center">สถานะ</th>
                <th className="py-4 pl-4 pr-12 text-right w-48">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {visibleRequests.map((req, index) => (
                <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-4 pl-12 font-medium text-slate-900">{index + 1}</td>
                  <td className="py-4 px-6 text-slate-700">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span>{req.topic}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600">{req.department}</td>
                  <td className="py-4 px-6 text-slate-500">{new Date(req.date).toLocaleDateString('th-TH')}</td>
                  <td className="py-4 px-6">
                    {req.developerId ? (
                      <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold text-slate-600">
                        {users.find(u => u.id === req.developerId)?.name.replace(/^(นาย|นางสาว|นาง|ดร\.)\s?/, '').split(' ')[0] || '-'}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button onClick={() => { setSelectedReq(req); setShowDetailsModal(true); }} className="hover:opacity-80 transition-opacity">
                      {getStatusBadge(req.status)}
                    </button>
                  </td>
                  <td className="py-4 pl-4 pr-12 text-right">
                    <div className="flex justify-end items-center gap-1">
                      {/* Slot 1: View */}
                      <div className="w-10 flex justify-center">
                        <button onClick={() => { setSelectedReq(req); setShowDetailsModal(true); }} className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="ดูรายละเอียด">
                          <Eye className="size-5" />
                        </button>
                      </div>

                      {/* Slot 2: Primary Action (Edit / Assign / Accept / Done) */}
                      <div className="w-10 flex justify-center">
                        {currentUser?.role === 'department' && req.status === 'done' && !requests.some(r => 
                          (r.sourceRequestId === req.id || r.topic.trim() === `[แก้ไข/เพิ่มเติม] ${req.topic.trim()}`) && 
                          r.status !== 'rejected'
                        ) && (
                          <button 
                            onClick={() => { 
                              setSelectedReq(req); 
                              setRevisionFormData({
                                topic: `[แก้ไข/เพิ่มเติม] ${req.topic}`,
                                objective: ''
                              });
                              setShowRevisionModal(true); 
                            }} 
                            className="p-1.5 text-slate-400 hover:text-primary transition-colors" 
                            title="ขอแก้ไข/เพิ่มเติม"
                          >
                            <RefreshCw className="size-5" />
                          </button>
                        )}
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
                            {req.status === 'accepted' && req.developerId === currentUser.id && (
                              <button onClick={() => handleDevAccept(req)} className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors" title="รอรับงาน">
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
                        {currentUser?.role === 'developer' && (req.status === 'accepted' || req.status === 'in_progress') && req.developerId === currentUser.id && (
                          <button onClick={() => { setSelectedReq(req); setShowAssignModal(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="ส่งต่องาน">
                            <Forward className="size-5" />
                          </button>
                        )}
                      </div>

                      {/* Slot 4: Download (if has attachments) */}
                      <div className="w-10 flex justify-center">
                        {req.attachmentUrl && (
                          <button 
                            onClick={() => handleDownloadAll(req.attachmentUrl!, req.id, req.department, req.date)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="ดาวน์โหลดเอกสารแนบ"
                          >
                            <Download className="size-5" />
                          </button>
                        )}
                      </div>

                      {/* Slot 5: Reject Action */}
                      <div className="w-10 flex justify-center">
                        {currentUser?.role === 'approver' && req.status !== 'done' && req.status !== 'rejected' && (
                           <button onClick={() => { setSelectedReq(req); setShowRejectModal(true); }} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors" title="ปฏิเสธ">
                             <XCircle className="size-5" />
                           </button>
                        )}
                        {currentUser?.role === 'developer' && (req.status === 'accepted' || req.status === 'in_progress') && req.developerId === currentUser.id && (
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
                  <td colSpan={7} className="py-12 text-center text-slate-500">ไม่มีข้อมูลคำขอ</td>
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
              <h4 className="text-lg font-bold text-slate-900">แก้ไขคำขอ</h4>
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
                <label className="text-sm font-semibold text-slate-700">กลุ่มผู้ใช้งาน <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={editFormData.userGroup}
                  onChange={(e) => setEditFormData({...editFormData, userGroup: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                  placeholder="IPD, OPD, เจ้าหน้าที่ หรือแผนกไหน"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">เบอร์โทรแผนก (4 หลัก) <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={editFormData.departmentPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setEditFormData({...editFormData, departmentPhone: val});
                  }}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                  placeholder="ระบุเบอร์โทร 4 หลัก"
                  maxLength={4}
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

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">แนบไฟล์เพิ่มเติม (ถ้ามี)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleEditFileChange}
                    className="hidden" 
                    id="edit-file-upload"
                  />
                  <label 
                    htmlFor="edit-file-upload"
                    className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                  >
                    <UploadCloud className="size-6 text-slate-400 group-hover:text-primary" />
                    <span className="text-sm font-medium text-slate-500 group-hover:text-primary">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</span>
                  </label>
                </div>
                
                {editFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {editFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="size-4 text-primary flex-shrink-0" />
                          <span className="text-xs font-medium text-slate-600 truncate">{file.name}</span>
                        </div>
                        <button 
                          onClick={() => removeEditFile(index)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <XCircle className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditFiles([]);
                }} 
                className="px-5 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition-all"
                disabled={isUploading}
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleEdit} 
                disabled={!editFormData.topic || !editFormData.estimatedUsers || !editFormData.objective || isUploading} 
                className="px-5 py-2 rounded-lg bg-primary hover:bg-secondary text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    บันทึกการแก้ไข
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-lg font-bold text-slate-900">ขอแก้ไข/เพิ่มเติมโปรแกรม</h4>
            </div>
            <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mb-2">
                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">อ้างอิงโครงการเดิม</p>
                <p className="text-sm font-medium text-slate-700">{selectedReq.topic} ({selectedReq.id})</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">หัวข้อการแก้ไข <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={revisionFormData.topic}
                  onChange={(e) => setRevisionFormData({...revisionFormData, topic: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">รายละเอียดสิ่งที่ต้องการแก้ไข/เพิ่มเติม <span className="text-rose-500">*</span></label>
                <textarea 
                  value={revisionFormData.objective}
                  onChange={(e) => setRevisionFormData({...revisionFormData, objective: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                  rows={4}
                  placeholder="อธิบายสิ่งที่ต้องการให้ปรับปรุง หรือฟีเจอร์ที่ต้องการเพิ่ม..."
                  required
                ></textarea>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">แนบไฟล์ประกอบเพิ่มเติม (ถ้ามี)</label>
                <label className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer">
                  <UploadCloud className="size-8 text-slate-400" />
                  <span className="text-xs text-slate-500">คลิกเพื่ออัปโหลดไฟล์ไอเดียเพิ่มเติม</span>
                  <input type="file" className="hidden" onChange={handleRevisionFileChange} multiple />
                </label>
                
                {revisionFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {revisionFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 truncate max-w-[200px]">{file.name}</span>
                        <button type="button" onClick={() => removeRevisionFile(index)} className="text-rose-500 hover:text-rose-700 text-xs font-bold">ลบ</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowRevisionModal(false)} 
                className="px-5 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition-all"
                disabled={isUploading}
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleRevisionSubmit} 
                disabled={!revisionFormData.topic || !revisionFormData.objective || isUploading} 
                className="px-5 py-2 rounded-lg bg-primary hover:bg-secondary text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    ส่งคำขอแก้ไข
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-8">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-full flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h4 className="text-xl font-black text-slate-900">รายละเอียดคำขอ</h4>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowDetailsModal(false)}
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
                        // Fallback for old single URL format
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

              {/* Modal Actions */}
              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                {currentUser?.role === 'department' && selectedReq.status === 'done' && (
                  <button 
                    onClick={() => {
                      setShowDetailsModal(false);
                      setRevisionFormData({
                        topic: `[แก้ไข/เพิ่มเติม] ${selectedReq.topic}`,
                        objective: ''
                      });
                      setShowRevisionModal(true);
                    }}
                    className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                  >
                    <RefreshCw className="size-5" />
                    ขอแก้ไข/เพิ่มเติม
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900">กำหนดการพัฒนา</h3>
                <button 
                  onClick={() => {
                    setShowScheduleModal(false);
                    setSelectedReq(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <XCircle className="size-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h5 className="text-sm font-bold text-slate-500 mb-1">หัวข้อ/ชื่อโปรแกรม</h5>
                  <p className="text-lg font-bold text-slate-900">{selectedReq.topic}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ThaiMonthPicker 
                    label="เริ่มพัฒนา (เดือน/ปี)"
                    value={scheduleStartMonth}
                    onChange={(val) => {
                      setScheduleStartMonth(val);
                      // Reset end month if it becomes invalid
                      if (scheduleEndMonth) {
                        const [y1, m1] = val.split('-').map(Number);
                        const [y2, m2] = scheduleEndMonth.split('-').map(Number);
                        if (y2 < y1 || (y2 === y1 && m2 < m1)) {
                          setScheduleEndMonth('');
                        }
                      }
                    }}
                  />
                  <ThaiMonthPicker 
                    label="คาดว่าเสร็จ (เดือน/ปี)"
                    value={scheduleEndMonth}
                    onChange={(val) => setScheduleEndMonth(val)}
                    minDate={scheduleStartMonth}
                  />
                </div>

                {scheduleStartMonth && scheduleEndMonth && (
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600">ระยะเวลาดำเนินการรวม:</span>
                    <span className={`text-lg font-black ${
                      (() => {
                        const [y1, m1] = scheduleStartMonth.split('-').map(Number);
                        const [y2, m2] = scheduleEndMonth.split('-').map(Number);
                        const diff = (y2 - y1) * 12 + (m2 - m1) + 1;
                        return diff > 0;
                      })() ? 'text-primary' : 'text-rose-500'
                    }`}>
                      {(() => {
                        const [y1, m1] = scheduleStartMonth.split('-').map(Number);
                        const [y2, m2] = scheduleEndMonth.split('-').map(Number);
                        const diff = (y2 - y1) * 12 + (m2 - m1) + 1;
                        return diff > 0 ? `${diff} เดือน` : 'ข้อมูลไม่ถูกต้อง';
                      })()}
                    </span>
                  </div>
                )}

                <div className="pt-4">
                  <button 
                    onClick={handleScheduleSubmit}
                    disabled={(() => {
                      if (!scheduleStartMonth || !scheduleEndMonth) return true;
                      const [y1, m1] = scheduleStartMonth.split('-').map(Number);
                      const [y2, m2] = scheduleEndMonth.split('-').map(Number);
                      const diff = (y2 - y1) * 12 + (m2 - m1) + 1;
                      return diff <= 0;
                    })()}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200 enabled:active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Save className="size-5" />
                    บันทึกกำหนดการและเริ่มงาน
                  </button>
                </div>
              </div>
            </div>
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
