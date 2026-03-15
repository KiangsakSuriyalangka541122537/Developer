import { useAppStore } from '../store';
import { BarChart, Users, CheckCircle, Clock, Briefcase } from 'lucide-react';

export default function Dashboard() {
  const { requests, users, currentUser } = useAppStore();

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

  return (
    <div className="space-y-8 overflow-hidden">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">ภาพรวมสถานะการขอพัฒนาโปรแกรมทั้งหมดในระบบ</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium text-sm">คำขอทั้งหมด</span>
            <div className="size-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <BarChart className="size-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium text-sm">รออนุมัติ</span>
            <div className="size-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
              <Clock className="size-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.pending}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium text-sm">กำลังดำเนินการ</span>
            <div className="size-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <Users className="size-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.inProgress}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium text-sm">เสร็จสิ้น</span>
            <div className="size-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="size-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.done}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <h3 className="font-bold text-lg text-slate-900 py-6 pl-12 border-b border-slate-100">รายการคำขอทั้งหมด</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-sm font-medium border-b border-slate-100 bg-slate-50/50">
                <th className="py-4 pl-12 w-20">ลำดับ</th>
                <th className="py-4 px-6 w-1/3">ชื่อโครงการ</th>
                <th className="py-4 px-6">แผนก</th>
                <th className="py-4 px-6">วันที่ขอ</th>
                <th className="py-4 pr-12 text-center w-40">สถานะ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {requests.map((req, index) => {
                const isMyRequest = currentUser?.id === req.requesterId;
                return (
                  <tr key={req.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${isMyRequest ? 'bg-primary/[0.03]' : ''}`}>
                    <td className="py-4 pl-12 font-medium text-slate-900">{index + 1}</td>
                    <td className="py-4 px-6 text-slate-700">
                      <div className="flex items-center gap-2">
                        {req.topic}
                        {isMyRequest && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">My Request</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{req.department}</td>
                    <td className="py-4 px-6 text-slate-500">{new Date(req.date).toLocaleDateString('th-TH')}</td>
                    <td className="py-4 pr-12 text-center">
                      <span className={`inline-flex items-center justify-center w-28 py-1 rounded-full text-xs font-medium border status-${req.status.replace('_', '')}`}>
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
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-medium italic">ไม่มีข้อมูลคำขอในระบบ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {currentUser?.role === 'approver' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="size-5 text-primary" />
            <h3 className="font-bold text-lg text-slate-900">ภาระงานผู้พัฒนาโปรแกรม (Workload)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {developerWorkload.map(dev => (
              <div key={dev.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{dev.name}</span>
                  <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                    รวม {dev.accepted + dev.inProgress + dev.done} งาน
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">รับงานใหม่</p>
                    <p className="font-bold text-blue-600">{dev.accepted}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">กำลังทำ</p>
                    <p className="font-bold text-primary">{dev.inProgress}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">เสร็จสิ้น</p>
                    <p className="font-bold text-emerald-600">{dev.done}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
