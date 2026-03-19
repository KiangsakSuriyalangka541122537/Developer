import React, { forwardRef } from 'react';
import { DevRequest } from '../store';

interface PrintableRequestProps {
  request: DevRequest;
}

const formatThaiDate = (dateString: string) => {
  if (!dateString) return '';
  
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      
      const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      
      if (month >= 1 && month <= 12) {
        return `${day} ${thaiMonths[month - 1]} ${year}`;
      }
    }
  }
  
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      const day = date.getDate();
      const month = thaiMonths[date.getMonth()];
      const year = date.getFullYear() < 2500 ? date.getFullYear() + 543 : date.getFullYear();
      return `${day} ${month} ${year}`;
    }
  } catch (e) {
    // ignore
  }
  
  return dateString;
};

export const PrintableRequest = forwardRef<HTMLDivElement, PrintableRequestProps>(
  ({ request }, ref) => {
    return (
      <div 
        ref={ref} 
        className="bg-white text-black mx-auto relative" 
        style={{ 
          width: '210mm', 
          minHeight: '297mm', 
          padding: '2.5cm 2cm 2cm 3cm',
          fontFamily: "'Sarabun', sans-serif",
          lineHeight: '1.5'
        }}
      >
        {/* Header Section */}
        <div className="relative mb-6">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Garuda_Emblem_of_Thailand.svg/150px-Garuda_Emblem_of_Thailand.svg.png" 
            alt="Garuda" 
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            className="absolute top-[-1cm] left-[-1.5cm] w-[1.5cm] object-contain" 
          />
          <div className="text-center pt-[0.5cm]">
            <span className="text-[29pt] font-bold">บันทึกข้อความ</span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-3 mb-6 text-[16pt]">
          <div className="flex items-end">
            <span className="text-[20pt] font-bold mr-4 leading-none">ส่วนราชการ</span>
            <span className="flex-1 border-b-[1.5px] border-dotted border-black pb-0 leading-none">{request.department}</span>
          </div>
          <div className="flex items-end gap-4">
            <div className="flex items-end flex-[1.2]">
              <span className="text-[20pt] font-bold mr-4 leading-none">ที่</span>
              <span className="flex-1 border-b-[1.5px] border-dotted border-black pb-0 leading-none"></span>
            </div>
            <div className="flex items-end flex-1">
              <span className="text-[20pt] font-bold mr-4 leading-none">วันที่</span>
              <span className="flex-1 border-b-[1.5px] border-dotted border-black pb-0 leading-none">{formatThaiDate(request.date)}</span>
            </div>
          </div>
          <div className="flex items-end">
            <span className="text-[20pt] font-bold mr-4 leading-none">เรื่อง</span>
            <span className="flex-1 border-b-[1.5px] border-dotted border-black pb-0 leading-none">ขอความอนุเคราะห์พัฒนาโปรแกรม ({request.topic})</span>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4 flex items-end text-[16pt]">
          <span className="text-[20pt] font-bold mr-4 leading-none">เรียน</span>
          <span className="leading-none">ผู้อำนวยการ</span>
        </div>

        <div className="text-[16pt] leading-relaxed">
          <p className="mb-4 text-justify" style={{ textIndent: '2.5cm' }}>
            ด้วยหน่วยงาน {request.department} มีความประสงค์ขอให้มีการพัฒนาโปรแกรมในหัวข้อ {request.topic} เพื่อรองรับการใช้งานของกลุ่มผู้ใช้งาน {request.userGroup || '-'} จำนวนประมาณ {request.estimatedUsers} คน {request.currentSystem ? `โดยมีระบบเดิมที่ใช้งานอยู่คือ ${request.currentSystem}` : ''}
          </p>

          <p className="mb-4 text-justify" style={{ textIndent: '2.5cm' }}>
            ในการนี้ จึงขอความอนุเคราะห์กลุ่มงานเทคโนโลยีสารสนเทศดำเนินการพัฒนาโปรแกรมดังกล่าว โดยมีวัตถุประสงค์และความต้องการคือ {request.objective}
          </p>

          <p className="mb-12 text-justify" style={{ textIndent: '2.5cm' }}>
            จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติให้ดำเนินการพัฒนาโปรแกรมดังกล่าวต่อไป
          </p>
        </div>

        {/* Requester Signature */}
        <div className="flex flex-col items-end pr-[1cm] mb-16 text-[16pt]">
          <div className="text-center">
            <div className="mb-12"></div>
            <p>(.......................................................)</p>
            <p className="mt-1">ผู้ขอรับบริการ</p>
            <p>แผนก {request.department}</p>
          </div>
        </div>

        {/* Approvers Signatures */}
        <div className="grid grid-cols-3 gap-4 text-center text-[14pt] mt-auto pt-8">
          <div>
            <div className="mb-12"></div>
            <p>(นายกิตติพงษ์ ชัยศรี)</p>
            <p className="mt-1">หัวหน้ากลุ่มงานเทคโนโลยีสารสนเทศ</p>
          </div>
          <div>
            <div className="mb-12"></div>
            <p>(พ.สายชล รัชตธรรมากูล)</p>
            <p className="mt-1">ผู้ช่วยผู้อำนวยการด้านการเงินการคลัง</p>
            <p>และระบบประกันสุขภาพ</p>
          </div>
          <div>
            <div className="mb-12"></div>
            <p>(ผศ.(พิเศษ) นพ.สมิทธ์ เกิดสินธ์ุ)</p>
            <p className="mt-1">รองผู้อำนวยการด้านสุขภาพดิจิทัล</p>
            <p>และหัวหน้ากลุ่มภารกิจสุขภาพดิจิทัล</p>
          </div>
        </div>
      </div>
    );
  }
);

PrintableRequest.displayName = 'PrintableRequest';
