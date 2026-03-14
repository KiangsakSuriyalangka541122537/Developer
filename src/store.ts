import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addRequest: (req: Omit<DevRequest, 'id' | 'status' | 'createdAt'>) => void;
  updateRequest: (id: string, updates: Partial<DevRequest>) => void;
  deleteRequest: (id: string) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  deleteUser: (id: string) => void;
}

const initialUsers: User[] = [
  { id: '1', username: 'it', password: 'it', role: 'department', name: 'งานเทคโนโลยีสารสนเทศ' },
  { id: '2', username: 'fin', password: 'fin', role: 'department', name: 'งานการเงิน' },
  { id: '3', username: 'or', password: 'or', role: 'department', name: 'งานผ่าตัด' },
  { id: '4', username: 'tor', password: 'tor', role: 'approver', name: 'นายกิตติพงษ์ ชัยศรี', position: 'นักวิชาการคอมพิวเตอร์' },
  { id: '5', username: 'team', password: 'team', role: 'developer', name: 'นายวิทวัส หมายมั่น', position: 'นักวิชาการคอมพิวเตอร์' },
  { id: '6', username: 'parn', password: 'parn', role: 'developer', name: 'นางสาวนิธิพร ใสปา', position: 'นักวิชาการคอมพิวเตอร์' }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: initialUsers,
      requests: [],
      login: (username, password) => {
        const user = get().users.find(u => u.username === username && u.password === password);
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },
      logout: () => set({ currentUser: null }),
      addRequest: (reqData) => set((state) => {
        const newId = `REQ-${new Date().getFullYear()}-${String(state.requests.length + 1).padStart(3, '0')}`;
        const newReq: DevRequest = {
          ...reqData,
          id: newId,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        return { requests: [newReq, ...state.requests] };
      }),
      updateRequest: (id, updates) => set((state) => ({
        requests: state.requests.map(r => r.id === id ? { ...r, ...updates } : r)
      })),
      deleteRequest: (id) => set((state) => ({
        requests: state.requests.filter(r => r.id !== id)
      })),
      updateUser: (id, updates) => set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, ...updates } : u),
        currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...updates } : state.currentUser
      })),
      addUser: (userData) => set((state) => ({
        users: [...state.users, { ...userData, id: Date.now().toString() }]
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id)
      }))
    }),
    {
      name: 'it-dev-request-storage',
    }
  )
);
