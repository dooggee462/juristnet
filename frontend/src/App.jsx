import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore.js';

import Landing from './pages/Landing.jsx';
import Listings from './pages/Listings.jsx';
import JuristProfile from './pages/JuristProfile.jsx';
import JuristAuth from './pages/JuristAuth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Inbox from './pages/Inbox.jsx';

function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/jurist/login" replace />;
}

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) fetchMe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/anunturi" element={<Listings />} />
        <Route path="/jurist/:id" element={<JuristProfile />} />
        <Route path="/jurist/login" element={<JuristAuth mode="login" />} />
        <Route path="/jurist/inregistrare" element={<JuristAuth mode="register" />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/inbox" element={<PrivateRoute><Inbox /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
