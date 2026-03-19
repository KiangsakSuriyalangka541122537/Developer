export type Signatory = {
  name: string;
  position: string;
  role?: string;
};

export type DocumentData = {
  type: 'internal' | 'external';
  agency: string;
  refNo: string;
  date: string;
  subject: string;
  to: string;
  content: string;
  signatories: Signatory[];
};

export const DEFAULT_DOCUMENT: DocumentData = {
  type: 'internal',
  agency: 'งานเทคโนโลยีสารสนเทศ',
  refNo: '',
  date: new Date().toISOString().split('T')[0],
  subject: 'ขอความอนุเคราะห์พัฒนาโปรแกรม (สาย IT)',
  to: 'ผู้อำนวยการ',
  content: 'ด้วยหน่วยงาน งานเทคโนโลยีสารสนเทศ มีความประสงค์ขอให้มีการพัฒนาโปรแกรมในหัวข้อ สาย IT เพื่อรองรับการใช้งานของกลุ่มผู้ใช้งาน - จำนวนประมาณ 6-20 คน\n\nวัตถุประสงค์และความต้องการ:\nสาย IT\n\nระบบเดิมที่ใช้งานอยู่: สาย IT\n\nจึงเรียนมาเพื่อโปรดพิจารณาอนุมัติให้ดำเนินการพัฒนาโปรแกรมดังกล่าวต่อไป',
  signatories: [
    { name: '(..........................................)', position: 'ผู้รับบริการ', role: 'แผนก งานเทคโนโลยีสารสนเทศ' },
    { name: '(นายกิตติพงษ์ ชัยศรี)', position: 'หัวหน้ากลุ่มงานเทคโนโลยีสารสนเทศ' },
    { name: '(พ.สายชล รัชตธรรมากุล)', position: 'ผู้ช่วยผู้อำนวยการด้านการเงินการคลัง', role: 'และระบบประกันสุขภาพ' },
    { name: '(ผศ.(พิเศษ) นพ.สมิทธ์ เกิดสินธุ์)', position: 'รองผู้อำนวยการด้านสุขภาพดิจิทัล', role: 'และหัวหน้ากลุ่มภารกิจสุขภาพดิจิทัล' },
  ],
};
