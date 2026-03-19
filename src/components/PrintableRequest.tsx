import React, { forwardRef } from 'react';
import { DevRequest } from '../store';

interface PrintableRequestProps {
  request: DevRequest;
}

const formatThaiDate = (dateString: string) => {
  if (!dateString) return '........ เดือน ........................ ปี....................';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} เดือน ${month} พ.ศ. ${year}`;
  } catch (e) {
    return dateString;
  }
};

export const PrintableRequest = forwardRef<HTMLDivElement, PrintableRequestProps>(
  ({ request }, ref) => {
    return (
      <div ref={ref} className="p-16 bg-white text-black" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', fontFamily: '"Sarabun", "TH Sarabun New", "TH Sarabun PSK", sans-serif' }}>
        {/* Header */}
        <div className="flex items-start mb-8 relative">
          {/* Garuda Logo Placeholder (Using a simple SVG to avoid external loading issues during print) */}
          <div className="absolute left-0 top-0 w-16 h-16 flex items-center justify-center border border-gray-300 rounded-full bg-gray-50">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
             </svg>
             <span className="sr-only">ตราครุฑ</span>
          </div>
          {/* Title */}
          <div className="w-full text-center pt-4">
            <h1 className="text-3xl font-bold">บันทึกข้อความ</h1>
          </div>
        </div>

        {/* Header Details */}
        <div className="text-lg leading-relaxed mb-8">
          <div className="flex items-baseline mb-2">
            <span className="font-bold mr-4 text-xl">ส่วนราชการ</span>
            <span className="flex-1">โรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช</span>
          </div>
          <div className="flex items-baseline gap-4 mb-2">
            <div className="flex items-baseline flex-1">
              <span className="font-bold mr-4 text-xl">ที่</span>
              <span className="flex-1">...0033.247/{request.id}</span>
            </div>
            <div className="flex items-baseline flex-1">
              <span className="font-bold mr-4 text-xl">วันที่</span>
              <span className="flex-1">{formatThaiDate(request.date)}</span>
            </div>
          </div>
          <div className="flex items-baseline mb-6">
            <span className="font-bold mr-4 text-xl">เรื่อง</span>
            <span className="flex-1">ขอความอนุเคราะห์พัฒนาโปรแกรม ({request.topic})</span>
          </div>

          <div className="mb-6">
            <span className="font-bold mr-4 text-xl">เรียน</span>
            <span>รองผู้อำนวยการด้านสุขภาพดิจิทัลและหัวหน้ากลุ่มภารกิจสุขภาพดิจิทัล</span>
          </div>
        </div>

        {/* Body */}
        <div className="text-lg leading-relaxed mb-8">
          <div className="mb-4">
            <span className="font-bold mr-4 text-xl">วัตถุประสงค์และความต้องการ:</span>
            <span className="break-words">{request.objective}</span>
          </div>

          <div className="mb-4">
            <span className="font-bold mr-4 text-xl">ระบบเดิมที่ใช้งานอยู่ (ถ้ามี):</span>
            <span className="break-words">{request.currentSystem || '-'}</span>
          </div>

          <div className="mb-4">
            <span className="font-bold mr-4 text-xl">แผนก/ฝ่าย:</span>
            <span className="break-words">{request.department}</span>
          </div>

          <div className="mb-6">
            <span className="font-bold mr-4 text-xl">กลุ่มผู้ใช้งาน:</span>
            <span className="break-words">{request.userGroup || '-'} (จำนวนประมาณ {request.estimatedUsers} คน)</span>
          </div>

          <p className="indent-16 mt-8">
            จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติให้ดำเนินการพัฒนาโปรแกรมดังกล่าวต่อไป
          </p>
        </div>

        {/* Signatures */}
        <div className="mt-20 grid grid-cols-2 gap-y-24 gap-x-8 text-center text-base">
          <div className="flex flex-col items-center">
            <p className="mb-8">(.......................................................)</p>
            <p>ผู้ขอรับบริการ</p>
            <p>แผนก {request.department}</p>
          </div>
          
          <div className="flex flex-col items-center">
            <p className="mb-8">(.......................................................)</p>
            <p>(นายกิตติพงษ์ ชัยศรี)</p>
            <p>หัวหน้ากลุ่มงานเทคโนโลยีสารสนเทศ</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="mb-8">(.......................................................)</p>
            <p>(พ.สายชล รัชตธรรมากูล)</p>
            <p>ผู้ช่วยผู้อำนวยการด้านการเงินการคลัง</p>
            <p>และระบบประกันสุขภาพ</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="mb-8">(.......................................................)</p>
            <p>(ผศ.(พิเศษ) นพ.สมิทธ์ เกิดสินธุ์)</p>
            <p>รองผู้อำนวยการด้านสุขภาพดิจิทัล</p>
            <p>และหัวหน้ากลุ่มภารกิจสุขภาพดิจิทัล</p>
          </div>
        </div>
      </div>
    );
  }
);

PrintableRequest.displayName = 'PrintableRequest';
