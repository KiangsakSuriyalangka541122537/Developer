import React, { useState } from 'react';
import { useAppStore } from '../store';
import { BarChart, Users, CheckCircle, Clock, Briefcase, Lock, Trophy, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { requests, users, currentUser } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    done: requests.filter(r => r.status === 'done').length,
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

  // Calculate department statistics
  const deptStats = requests.reduce((acc: Record<string, number>, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {});

  const topDepartments = Object.entries(deptStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const filteredRequests = filterStatus 
    ? requests.filter(r => r.status === filterStatus)
    : requests;

  const toggleFilter = (status: string | null) => {
    if (filterStatus === status) {
      setFilterStatus(null);
    } else {
      setFilterStatus(status);
    }
  };

  return (
    <div className="space-y-8 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">ภาพรวมสถานะการขอพัฒนาโปรแกรมทั้งหมดในระบบ</p>
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

      {!currentUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
              <Lock className="size-6" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 text-lg">กรุณาเข้าสู่ระบบเพื่อดูข้อมูล</h3>
              <p className="text-amber-700 text-sm">คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถเข้าถึงข้อมูลและสถานะการขอพัฒนาโปรแกรมทั้งหมดในระบบได้</p>
            </div>
          </div>
          <Link to="/login" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-amber-600/20 whitespace-nowrap">
            เข้าสู่ระบบตอนนี้
          </Link>
        </div>
      )}

      <div className={`space-y-8 ${!currentUser ? 'opacity-50 pointer-events-none select-none blur-[2px]' : ''}`}>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
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
                    <th className="py-4 pr-8 text-center w-32">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredRequests.map((req, index) => {
                    const isMyRequest = currentUser?.id === req.requesterId;
                    return (
                      <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                        <td className="py-4 pl-8 text-center font-bold text-slate-400 group-hover:text-primary transition-colors">{index + 1}</td>
                        <td className="py-4 px-6 text-slate-700">
                          <div className="flex items-center gap-2 font-bold">
                            {req.topic}
                            {isMyRequest && (
                              <div className="size-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" title="งานของแผนกคุณ" />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium">{req.department}</td>
                        <td className="py-4 px-6 text-slate-500 font-medium">{new Date(req.date).toLocaleDateString('th-TH')}</td>
                        <td className="py-4 pr-8 text-center">
                          <span className={`inline-flex items-center justify-center w-24 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tighter status-${req.status.replace('_', '')}`}>
                            {req.status === 'pending' && 'รออนุมัติ'}
                            {req.status === 'accepted' && 'รับงาน'}
                            {req.status === 'in_progress' && 'กำลังดำเนินการ'}
                            {req.status === 'done' && 'เสร็จสิ้น'}
                            {req.status === 'rejected' && 'ปฏิเสธ'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-24 text-center text-slate-400 font-medium italic">
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

          <div className="space-y-6">
            {(currentUser?.role === 'approver' || currentUser?.role === 'developer') && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Trophy className="size-5 text-amber-500" />
                  <h3 className="font-bold text-lg text-slate-900">สถิติแผนกที่ขอมากที่สุด</h3>
                </div>
                <div className="space-y-4">
                  {topDepartments.map(([dept, count], idx) => (
                    <div key={dept} className="group">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className={`size-5 flex items-center justify-center rounded-full text-[10px] font-bold ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{dept}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{count} คำขอ</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${idx === 0 ? 'bg-amber-400' : 'bg-primary/60'}`} 
                          style={{ width: `${(count / (topDepartments[0][1] || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {topDepartments.length === 0 && (
                    <p className="text-center text-slate-400 text-sm italic py-4">ยังไม่มีข้อมูลสถิติ</p>
                  )}
                </div>
              </div>
            )}

            {(currentUser?.role === 'approver' || currentUser?.role === 'developer') && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="size-5 text-primary" />
                  <h3 className="font-bold text-lg text-slate-900">ภาระงานผู้พัฒนา</h3>
                </div>
                <div className="space-y-4">
                  {developerWorkload.map(dev => (
                    <div key={dev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-slate-800 text-sm">{dev.name}</span>
                        <span className="text-[10px] font-bold text-primary bg-white px-2 py-0.5 rounded-full border border-primary/10">
                          {dev.accepted + dev.inProgress + dev.done} งาน
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">รับงาน</p>
                          <p className="font-bold text-blue-600 text-sm">{dev.accepted}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">กำลังทำ</p>
                          <p className="font-bold text-primary text-sm">{dev.inProgress}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">เสร็จสิ้น</p>
                          <p className="font-bold text-emerald-600 text-sm">{dev.done}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
