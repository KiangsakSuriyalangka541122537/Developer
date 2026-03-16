/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import RequestForm from './pages/RequestForm';
import WorkloadOverview from './pages/WorkloadOverview';
import Profile from './pages/Profile';
import Users from './pages/Users';
import { useAppStore } from './store';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { currentUser } = useAppStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { fetchData, currentUser } = useAppStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="login" element={<Login />} />
          <Route path="request" element={
            <ProtectedRoute allowedRoles={['department']}>
              <RequestForm />
            </ProtectedRoute>
          } />
          <Route path="workload" element={
            <ProtectedRoute allowedRoles={['approver', 'developer']}>
              <WorkloadOverview />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute allowedRoles={['approver']}>
              <Users />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

