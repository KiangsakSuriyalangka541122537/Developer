-- เว็บแอปที่สร้างอยู่นี้คือตัวทดสอบระบบ : เมื่อมีการสร้างฐานข้อมูลใน Supabase ทุกครั้ง
-- หากสร้าง SQL Editor / Table Editor ต้องสร้างด้วยว่า TEST-"ตามด้วยชื่อไฟล์" เสมอ
-- เพื่อป้องกันไม่ให้สร้างตารางทับกับ SQL Editor / Table Editor ที่เป็น Product ฐานข้อมูลจริง

CREATE TABLE public."TEST-users" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('department', 'approver', 'developer')),
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public."TEST-requests" (
    id VARCHAR(50) PRIMARY KEY,
    requester_id UUID REFERENCES public."TEST-users"(id),
    requester_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    topic VARCHAR(255) NOT NULL,
    estimated_users VARCHAR(50) NOT NULL,
    objective TEXT NOT NULL,
    current_system TEXT,
    attachment_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'done', 'rejected')),
    developer_id UUID REFERENCES public."TEST-users"(id),
    rejection_reason TEXT,
    start_month_year VARCHAR(50),
    expected_finish_month_year VARCHAR(50),
    project_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial data
INSERT INTO public."TEST-users" (id, username, password, role, name, position) VALUES
('11111111-1111-1111-1111-111111111111', 'it', 'it', 'department', 'งานเทคโนโลยีสารสนเทศ', NULL),
('22222222-2222-2222-2222-222222222222', 'fin', 'fin', 'department', 'งานการเงิน', NULL),
('33333333-3333-3333-3333-333333333333', 'or', 'or', 'department', 'งานผ่าตัด', NULL),
('44444444-4444-4444-4444-444444444444', 'tor', 'tor', 'approver', 'นายกิตติพงษ์ ชัยศรี', 'นักวิชาการคอมพิวเตอร์'),
('55555555-5555-5555-5555-555555555555', 'team', 'team', 'developer', 'นายวิทวัส หมายมั่น', 'นักวิชาการคอมพิวเตอร์'),
('66666666-6666-6666-6666-666666666666', 'parn', 'parn', 'developer', 'นางสาวนิธิพร ใสปา', 'นักวิชาการคอมพิวเตอร์');
