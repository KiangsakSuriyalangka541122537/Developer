import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './lib/supabase';

export type Role = 'department' | 'approver' | 'developer';
export type RequestStatus = 'pending' | 'accepted' | 'in_progress' | 'done' | 'rejected';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  name: string;
  position?: string;
}

export interface Department {
  id: string;
  name: string;
  createdAt: string;
}

export interface DevRequest {
  id: string;
  requesterId?: string | null;
  requesterName: string;
  department: string;
  date: string;
  topic: string;
  estimatedUsers: string;
  objective: string;
  currentSystem: string;
  attachmentUrl?: string | null;
  status: RequestStatus;
  developerId?: string | null;
  rejectionReason?: string | null;
  startMonthYear?: string | null;
  expectedFinishMonthYear?: string | null;
  projectLink?: string | null;
  previousDeveloperId?: string | null;
  sourceRequestId?: string | null;
  userGroup?: string | null;
  departmentPhone?: string | null;
  developerRemark?: string | null;
  createdAt: string;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  departments: Department[];
  requests: DevRequest[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addRequest: (req: Omit<DevRequest, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateRequest: (id: string, updates: Partial<DevRequest>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addDepartment: (name: string) => Promise<void>;
  updateDepartment: (id: string, name: string) => Promise<void>;
  importDepartments: (names: string[]) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      departments: [],
      requests: [],
      isLoading: false,

      fetchData: async () => {
        set({ isLoading: true });
        try {
          const [usersRes, requestsRes, departmentsRes] = await Promise.all([
            supabase.from('Dev-users').select('*'),
            supabase.from('Dev-requests').select('*').order('created_at', { ascending: false }),
            supabase.from('Dev-departments').select('*').order('name', { ascending: true })
          ]);

          const newState: Partial<AppState> = {};

          if (usersRes.data) {
            newState.users = usersRes.data.map(u => ({
              id: u.id,
              username: u.username,
              password: u.password,
              role: u.role,
              name: u.name,
              position: u.position
            }));
          } else if (usersRes.error) {
            console.error("Error fetching users:", usersRes.error);
          }

          if (requestsRes.data) {
            newState.requests = requestsRes.data.map(r => ({
              id: r.id,
              requesterId: r.requester_id,
              requesterName: r.requester_name,
              department: r.department,
              date: r.date,
              topic: r.topic,
              estimatedUsers: r.estimated_users,
              objective: r.objective,
              currentSystem: r.current_system,
              attachmentUrl: r.attachment_url,
              status: r.status,
              developerId: r.developer_id,
              rejectionReason: r.rejection_reason,
              startMonthYear: r.start_month_year,
              expectedFinishMonthYear: r.expected_finish_month_year,
              projectLink: r.project_link,
              previousDeveloperId: r.previous_developer_id,
              sourceRequestId: r.source_request_id,
              userGroup: r.user_group,
              departmentPhone: r.department_phone,
              developerRemark: r.developer_remark,
              createdAt: r.created_at
            }));
          } else if (requestsRes.error) {
            console.error("Error fetching requests:", requestsRes.error);
          }

          if (departmentsRes.data) {
            newState.departments = departmentsRes.data.map(d => ({
              id: d.id,
              name: d.name,
              createdAt: d.created_at
            }));
          } else if (departmentsRes.error) {
            console.error("Error fetching departments:", departmentsRes.error);
            if (departmentsRes.error.code === '42P01') {
              console.warn("Table Dev-departments is missing");
            }
          }

          if (Object.keys(newState).length > 0) {
            set(newState as any);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (username, password) => {
        try {
          const { data, error } = await supabase
            .from('Dev-users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

          if (error) {
            console.error("Login error from Supabase:", error);
            // If error code is 'PGRST116', it means no rows returned (invalid credentials)
            // But if we have 0 users found due to RLS, the above query won't even find the user
            return false;
          }

          if (data) {
            const user: User = {
              id: data.id,
              username: data.username,
              password: data.password,
              role: data.role,
              name: data.name,
              position: data.position
            };
            set({ currentUser: user });
            await get().fetchData();
            return true;
          }
        } catch (error) {
          console.error("Critical Login error:", error);
        }
        return false;
      },

      logout: () => set({ currentUser: null, requests: [] }),

      addRequest: async (reqData) => {
        // Generate a more unique ID to avoid conflicts
        const now = new Date();
        const year = now.getFullYear();
        const timestamp = now.getTime().toString().slice(-6); // Last 6 digits of timestamp
        const randomArray = new Uint32Array(1);
        crypto.getRandomValues(randomArray);
        const random = (randomArray[0] % 1000).toString().padStart(3, '0');
        const newId = `REQ-${year}-${timestamp}-${random}`;
        
        const newReq: any = {
          id: newId,
          requester_name: reqData.requesterName,
          department: reqData.department,
          date: reqData.date,
          topic: reqData.topic,
          estimated_users: reqData.estimatedUsers,
          objective: reqData.objective,
          current_system: reqData.currentSystem,
          attachment_url: reqData.attachmentUrl || null,
          user_group: (reqData as any).userGroup || null,
          department_phone: (reqData as any).departmentPhone || null,
          developer_remark: (reqData as any).developerRemark || null,
          status: 'pending'
        };

        if (reqData.requesterId) {
          newReq.requester_id = reqData.requesterId;
        }

        // Only add previous_developer_id if it's provided
        if ((reqData as any).previousDeveloperId) {
          newReq.previous_developer_id = (reqData as any).previousDeveloperId;
        }

        // Only add source_request_id if it's provided
        if ((reqData as any).sourceRequestId) {
          newReq.source_request_id = (reqData as any).sourceRequestId;
        }

        let { error } = await supabase.from('Dev-requests').insert([newReq]);
        
        // If it fails and we included new columns, try again without them
        const newColumns = ['previous_developer_id', 'source_request_id', 'user_group', 'department_phone', 'developer_remark'];
        if (error && newColumns.some(col => newReq[col] !== undefined)) {
          console.warn("Failed to insert with new columns, retrying without them...", error);
          alert("แจ้งเตือนจากระบบ: ฐานข้อมูล Supabase ของคุณยังไม่มีคอลัมน์ใหม่ ทำให้ข้อความ/ข้อมูลบางส่วนไม่ถูกบันทึก กรุณาเพิ่มคอลัมน์เหล่านี้ในตาราง Dev-requests: \n- developer_remark (text)\n- user_group (text)\n- department_phone (text)");
          const retryReq = { ...newReq };
          newColumns.forEach(col => delete retryReq[col]);
          const retry = await supabase.from('Dev-requests').insert([retryReq]);
          error = retry.error;
        }

        if (!error) {
          await get().fetchData();
        } else {
          console.error("Supabase Insert Error:", error);
          throw new Error(error.message || "Failed to insert request into database");
        }
      },

      updateRequest: async (id, updates) => {
        const dbUpdates: any = {};
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.developerId !== undefined) dbUpdates.developer_id = updates.developerId;
        if (updates.rejectionReason !== undefined) dbUpdates.rejection_reason = updates.rejectionReason;
        if (updates.startMonthYear !== undefined) dbUpdates.start_month_year = updates.startMonthYear;
        if (updates.expectedFinishMonthYear !== undefined) dbUpdates.expected_finish_month_year = updates.expectedFinishMonthYear;
        if (updates.projectLink !== undefined) dbUpdates.project_link = updates.projectLink;
        if (updates.previousDeveloperId !== undefined) dbUpdates.previous_developer_id = updates.previousDeveloperId;
        if (updates.sourceRequestId !== undefined) dbUpdates.source_request_id = updates.sourceRequestId;
        
        // Add missing fields for request editing
        if (updates.topic !== undefined) dbUpdates.topic = updates.topic;
        if (updates.estimatedUsers !== undefined) dbUpdates.estimated_users = updates.estimatedUsers;
        if (updates.objective !== undefined) dbUpdates.objective = updates.objective;
        if (updates.currentSystem !== undefined) dbUpdates.current_system = updates.currentSystem;
        if (updates.attachmentUrl !== undefined) dbUpdates.attachment_url = updates.attachmentUrl;
        if (updates.userGroup !== undefined) dbUpdates.user_group = updates.userGroup;
        if (updates.departmentPhone !== undefined) dbUpdates.department_phone = updates.departmentPhone;
        if (updates.developerRemark !== undefined) dbUpdates.developer_remark = updates.developerRemark;

        let { error } = await supabase.from('Dev-requests').update(dbUpdates).eq('id', id);
        
        // If it fails and we included new columns, try again without them
        const newColumns = ['previous_developer_id', 'source_request_id', 'user_group', 'department_phone', 'developer_remark'];
        if (error && newColumns.some(col => dbUpdates[col] !== undefined)) {
          console.warn("Failed to update with new columns, retrying without them...", error);
          alert("แจ้งเตือนจากระบบ: ฐานข้อมูล Supabase ของคุณยังไม่มีคอลัมน์ใหม่ (เช่น developer_remark) ทำให้ข้อความไม่ถูกบันทึก กรุณาเพิ่มคอลัมน์เหล่านี้ในตาราง Dev-requests: \n- developer_remark (text)\n- user_group (text)\n- department_phone (text)");
          const retryUpdates = { ...dbUpdates };
          newColumns.forEach(col => delete retryUpdates[col]);
          const retry = await supabase.from('Dev-requests').update(retryUpdates).eq('id', id);
          error = retry.error;
        }

        if (!error) {
          await get().fetchData();
        } else {
          console.error("Error updating request:", error);
          throw new Error(error.message || "Failed to update request");
        }
      },

      deleteRequest: async (id) => {
        const { error } = await supabase.from('Dev-requests').delete().eq('id', id);
        if (!error) {
          await get().fetchData();
        } else {
          console.error("Error deleting request:", error);
        }
      },

      updateUser: async (id, updates) => {
        const { error } = await supabase.from('Dev-users').update(updates).eq('id', id);
        if (!error) {
          await get().fetchData();
          if (get().currentUser?.id === id) {
            set({ currentUser: { ...get().currentUser!, ...updates } });
          }
        } else {
          console.error("Error updating user:", error);
        }
      },

      addUser: async (userData) => {
        const newUser = {
          id: Date.now().toString(),
          ...userData
        };
        const { error } = await supabase.from('Dev-users').insert([newUser]);
        if (!error) {
          await get().fetchData();
        } else {
          console.error("Error adding user:", error);
        }
      },

      deleteUser: async (id) => {
        const { error } = await supabase.from('Dev-users').delete().eq('id', id);
        if (!error) {
          await get().fetchData();
        } else {
          console.error("Error deleting user:", error);
        }
      },

      addDepartment: async (name) => {
        const newDept = {
          id: Date.now().toString(),
          name
        };
        const { error } = await supabase.from('Dev-departments').insert([newDept]);
        if (!error) {
          await get().fetchData();
        } else {
          console.error("Error adding department:", error);
          alert(`ไม่สามารถเพิ่มแผนกได้: ${error.message}\n(ตรวจสอบว่าได้สร้างตารางและเปิดสิทธิ์ RLS หรือยัง)`);
        }
      },

      updateDepartment: async (id, name) => {
        const { error } = await supabase
          .from('Dev-departments')
          .update({ name })
          .eq('id', id);
        
        if (!error) {
          await get().fetchData();
        } else {
          console.error("Error updating department:", error);
          alert(`ไม่สามารถแก้ไขแผนกได้: ${error.message}`);
        }
      },

      importDepartments: async (names) => {
        const newDepts = names.map((name, index) => ({
          id: (Date.now() + index).toString(),
          name
        }));
        const { error } = await supabase.from('Dev-departments').insert(newDepts);
        if (!error) {
          await get().fetchData();
        } else {
          console.error("Error importing departments:", error);
          alert(`ไม่สามารถนำเข้าแผนกได้: ${error.message}`);
        }
      },

      deleteDepartment: async (id) => {
        const { error } = await supabase.from('Dev-departments').delete().eq('id', id);
        if (!error) {
          await get().fetchData();
        } else {
          console.error("Error deleting department:", error);
        }
      }
    }),
    {
      name: 'it-dev-request-storage',
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);
