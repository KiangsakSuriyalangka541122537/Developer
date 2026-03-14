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

export interface DevRequest {
  id: string;
  requesterId: string;
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
  createdAt: string;
}

interface AppState {
  currentUser: User | null;
  users: User[];
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
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      requests: [],
      isLoading: false,

      fetchData: async () => {
        set({ isLoading: true });
        try {
          const [usersRes, requestsRes] = await Promise.all([
            supabase.from('Dev-users').select('*'),
            supabase.from('Dev-requests').select('*').order('created_at', { ascending: false })
          ]);

          if (usersRes.data && requestsRes.data) {
            const users = usersRes.data.map(u => ({
              id: u.id,
              username: u.username,
              password: u.password,
              role: u.role,
              name: u.name,
              position: u.position
            }));

            const requests = requestsRes.data.map(r => ({
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
              createdAt: r.created_at
            }));

            set({ users, requests });
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

          if (data && !error) {
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
          console.error("Login error:", error);
        }
        return false;
      },

      logout: () => set({ currentUser: null, requests: [] }),

      addRequest: async (reqData) => {
        const newId = `REQ-${new Date().getFullYear()}-${String(get().requests.length + 1).padStart(3, '0')}`;
        const newReq = {
          id: newId,
          requester_id: reqData.requesterId,
          requester_name: reqData.requesterName,
          department: reqData.department,
          date: reqData.date,
          topic: reqData.topic,
          estimated_users: reqData.estimatedUsers,
          objective: reqData.objective,
          current_system: reqData.currentSystem,
          attachment_url: reqData.attachmentUrl || null,
          status: 'pending',
          created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('Dev-requests').insert([newReq]);
        if (!error) {
          await get().fetchData();
        } else {
          console.error("Error adding request:", error);
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

        const { error } = await supabase.from('Dev-requests').update(dbUpdates).eq('id', id);
        if (!error) {
          await get().fetchData();
        } else {
          console.error("Error updating request:", error);
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
      }
    }),
    {
      name: 'it-dev-request-storage',
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);
