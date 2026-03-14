/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import RequestForm from './pages/RequestForm';
import RequestList from './pages/RequestList';
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
          <Route path="list" element={
            <ProtectedRoute>
              <RequestList />
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

