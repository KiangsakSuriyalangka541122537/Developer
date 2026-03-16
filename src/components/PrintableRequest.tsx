import React, { forwardRef } from 'react';
import { DevRequest } from '../store';

interface PrintableRequestProps {
  request: DevRequest;
}

export const PrintableRequest = forwardRef<HTMLDivElement, PrintableRequestProps>(
  ({ request }, ref) => {
    return (
      <div ref={ref} className="p-12 bg-white text-black font-sans" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold">บันทึกข้อความ</h1>
          </div>
          
          <div className="flex flex-col gap-2 text-lg">
            <div className="flex gap-4">
              <div className="flex-1">
                <strong>ส่วนราชการ</strong> <span className="ml-2">{request.department}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <strong>ที่</strong> <span className="ml-2">.......................................................</span>
              </div>
              <div className="flex-1">
                <strong>วันที่</strong> <span className="ml-2">{request.date}</span>
              </div>
            </div>
            <div>
              <strong>เรื่อง</strong> <span className="ml-2">ขอความอนุเคราะห์พัฒนาโปรแกรม ({request.topic})</span>
            </div>
          </div>
        </div>

        <div className="mb-6 text-lg leading-relaxed">
          <p className="mb-4"><strong>เรียน</strong> ผู้อำนวยการ</p>
          
          <p className="mb-4 indent-12">
            ด้วยหน่วยงาน {request.department} มีความประสงค์ขอให้มีการพัฒนาโปรแกรมในหัวข้อ <strong>{request.topic}</strong> 
            เพื่อรองรับการใช้งานของกลุ่มผู้ใช้งาน <strong>{request.userGroup || '-'}</strong> จำนวนประมาณ <strong>{request.estimatedUsers}</strong> คน
          </p>

          <p className="mb-4 indent-12">
            <strong>วัตถุประสงค์และความต้องการ:</strong><br/>
            {request.objective}
          </p>

          {request.currentSystem && (
            <p className="mb-4 indent-12">
              <strong>ระบบเดิมที่ใช้งานอยู่:</strong> {request.currentSystem}
            </p>
          )}

          <p className="mb-8 indent-12">
            จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติให้ดำเนินการพัฒนาโปรแกรมดังกล่าวต่อไป
          </p>
        </div>

        <div className="mt-24 grid grid-cols-2 gap-y-24 gap-x-16 text-center text-base">
          <div>
            <div className="mb-12"></div>
            <p>(.......................................................)</p>
            <p className="mt-2">ผู้ขอรับบริการ</p>
            <p>แผนก {request.department}</p>
          </div>
          
          <div>
            <div className="mb-12"></div>
            <p>(นายกิตติพงษ์ ชัยศรี)</p>
            <p className="mt-2">หัวหน้ากลุ่มงานเทคโนโลยีสารสนเทศ</p>
          </div>

          <div>
            <div className="mb-12"></div>
            <p>(พ.สายชล รัชตธรรมากูล)</p>
            <p className="mt-2">ผู้ช่วยผู้อำนวยการด้านการเงินการคลัง</p>
            <p>และระบบประกันสุขภาพ</p>
          </div>

          <div>
            <div className="mb-12"></div>
            <p>(ผศ.(พิเศษ) นพ.สมิทธ์ เกิดสินธ์ุ)</p>
            <p className="mt-2">รองผู้อำนวยการด้านสุขภาพดิจิทัล</p>
            <p>และหัวหน้ากลุ่มภารกิจสุขภาพดิจิทัล</p>
          </div>
        </div>
      </div>
    );
  }
);

PrintableRequest.displayName = 'PrintableRequest';
