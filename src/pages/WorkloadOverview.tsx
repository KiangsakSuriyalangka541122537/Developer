import { useAppStore } from '../store';
import { Briefcase, Forward, UserCircle } from 'lucide-react';

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
        <div className="space-y-4">
          {developerWorkload.map(dev => (
            <div key={dev.id} className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-600/30 hover:shadow-lg hover:shadow-emerald-600/5 transition-all flex flex-col xl:flex-row justify-between gap-6">
              
              <div className="flex items-center gap-4 xl:w-1/3">
                <div className="size-14 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                  <UserCircle className="size-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{dev.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-sm text-slate-500 font-medium">{dev.position || 'นักวิชาการคอมพิวเตอร์'}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      รวม {dev.stats.accepted + dev.stats.inProgress + dev.stats.done} งาน
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 xl:w-[250px] shrink-0">
                <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 flex-1 text-center group-hover:bg-blue-50/50 transition-colors">
                  <span className="block text-[10px] text-slate-400 font-bold mb-0.5 uppercase tracking-wider">รอรับงาน</span>
                  <span className="font-bold text-blue-600 text-xl">{dev.stats.accepted}</span>
                </div>
                <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 flex-1 text-center group-hover:bg-amber-50/50 transition-colors">
                  <span className="block text-[10px] text-slate-400 font-bold mb-0.5 uppercase tracking-wider">กำลังทำ</span>
                  <span className="font-bold text-amber-600 text-xl">{dev.stats.inProgress}</span>
                </div>
                <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 flex-1 text-center group-hover:bg-emerald-50/50 transition-colors">
                  <span className="block text-[10px] text-slate-400 font-bold mb-0.5 uppercase tracking-wider">เสร็จสิ้น</span>
                  <span className="font-bold text-emerald-600 text-xl">{dev.stats.done}</span>
                </div>
              </div>

              <div className="flex-1 border-t xl:border-t-0 xl:border-l border-slate-100 pt-4 xl:pt-0 xl:pl-6 flex flex-col justify-center">
                <div className="space-y-2">
                  {dev.activeRequests.length > 0 ? (
                    dev.activeRequests.slice(0, 2).map(req => (
                      <div key={req.id} className="flex items-center gap-3">
                        <Forward className="size-4 text-slate-400 shrink-0" />
                        <span className="truncate text-sm text-slate-700 font-medium flex-1">{req.topic}</span>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'in_progress' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {req.status === 'in_progress' ? 'กำลังทำ' : 'รอรับงาน'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic flex items-center gap-2">
                      <Briefcase className="size-4 opacity-50" />
                      ไม่มีงานที่กำลังดำเนินการ
                    </p>
                  )}
                  {dev.activeRequests.length > 2 && (
                    <p className="text-xs text-slate-400 font-medium pl-7">และอีก {dev.activeRequests.length - 2} งาน...</p>
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
