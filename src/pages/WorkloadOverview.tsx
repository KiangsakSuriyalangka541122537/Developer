import { useAppStore } from '../store';
import { Briefcase, Forward } from 'lucide-react';

export default function WorkloadOverview() {
  const { requests, users } = useAppStore();

  const developers = users.filter(u => u.role === 'developer');

  const developerWorkload = developers.map(dev => {
    const devRequests = requests.filter(r => r.developerId === dev.id);
    return {
      ...dev,
      activeRequests: devRequests.filter(r => r.status === 'accepted' || r.status === 'in_progress'),
      stats: {
        accepted: devRequests.filter(r => r.status === 'accepted').length,
        inProgress: devRequests.filter(r => r.status === 'in_progress').length,
        done: devRequests.filter(r => r.status === 'done').length,
      }
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">ภาระงาน</h1>
        <p className="text-slate-500 mt-1">ติดตามสถานะและภาระงานของผู้พัฒนาโปรแกรม</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-8">
          <Briefcase className="size-6 text-emerald-700" />
          <h3 className="font-bold text-xl text-slate-900">ภาระงานผู้พัฒนา</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {developerWorkload.map(dev => (
            <div key={dev.id} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-8 flex flex-col gap-8">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-slate-900 block text-xl">{dev.name}</span>
                  <span className="text-sm text-slate-500 mt-1 block">{dev.position || 'นักวิชาการคอมพิวเตอร์'}</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200">
                  รวม {dev.stats.accepted + dev.stats.inProgress + dev.stats.done} งาน
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-400 font-bold mb-2">รอรับงาน</p>
                  <p className="font-bold text-blue-600 text-2xl">{dev.stats.accepted}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-400 font-bold mb-2">กำลังทำ</p>
                  <p className="font-bold text-emerald-700 text-2xl">{dev.stats.inProgress}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-400 font-bold mb-2">เสร็จสิ้น</p>
                  <p className="font-bold text-emerald-600 text-2xl">{dev.stats.done}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2">
                  <Forward className="size-4" /> งานปัจจุบัน:
                </p>
                <div className="space-y-3">
                  {dev.activeRequests.length > 0 ? (
                    dev.activeRequests.slice(0, 3).map(req => (
                      <div key={req.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                        <span className="truncate pr-4 text-sm text-slate-700 font-medium">{req.topic}</span>
                        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
                          req.status === 'in_progress' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {req.status === 'in_progress' ? 'กำลังทำ' : 'รอรับงาน'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic">ไม่มีงานที่กำลังดำเนินการ</p>
                  )}
                  {dev.activeRequests.length > 3 && (
                    <p className="text-xs text-center text-slate-400 font-medium mt-3">และอีก {dev.activeRequests.length - 3} รายการ...</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
