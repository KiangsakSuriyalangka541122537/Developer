import React, { forwardRef } from 'react';
import { DocumentData } from '../types';

interface PrintableDocumentProps {
  data: DocumentData;
}

export const PrintableDocument = forwardRef<HTMLDivElement, PrintableDocumentProps>(
  ({ data }, ref) => {
    const formatDate = (dateStr: string) => {
      try {
        const date = new Date(dateStr);
        const thaiMonths = [
          'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
          'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
      } catch (e) {
        return dateStr;
      }
    };

    return (
      <div ref={ref} className="p-[2.5cm] bg-white text-black font-serif" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', fontSize: '16pt', lineHeight: '1.5' }}>
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h1 className="text-3xl font-bold border-b-4 border-black pb-1">
              {data.type === 'internal' ? 'บันทึกข้อความ' : 'หนังสือราชการ'}
            </h1>
          </div>
          
          <div className="space-y-2">
            <div className="flex">
              <span className="font-bold w-32">ส่วนราชการ</span>
              <span className="flex-1 border-b border-dotted border-slate-400 pb-1">{data.agency}</span>
            </div>
            
            <div className="flex gap-8">
              <div className="flex flex-1">
                <span className="font-bold w-12">ที่</span>
                <span className="flex-1 border-b border-dotted border-slate-400 pb-1">{data.refNo || '.......................................................'}</span>
              </div>
              <div className="flex flex-1">
                <span className="font-bold w-16">วันที่</span>
                <span className="flex-1 border-b border-dotted border-slate-400 pb-1">{formatDate(data.date)}</span>
              </div>
            </div>

            <div className="flex">
              <span className="font-bold w-16">เรื่อง</span>
              <span className="flex-1 border-b border-dotted border-slate-400 pb-1">{data.subject}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 leading-relaxed">
          <p className="mb-6"><span className="font-bold">เรียน</span> {data.to}</p>
          
          <div className="whitespace-pre-wrap text-justify" style={{ textIndent: '2.5cm' }}>
            {data.content}
          </div>
        </div>

        <div className="mt-24 grid grid-cols-2 gap-y-24 gap-x-12 text-center text-base">
          {data.signatories.map((sig, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-48 border-b border-dotted border-black mb-2"></div>
              <p className="font-bold">{sig.name || '.......................................................'}</p>
              <p>{sig.position}</p>
              {sig.role && <p>{sig.role}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

PrintableDocument.displayName = 'PrintableDocument';
