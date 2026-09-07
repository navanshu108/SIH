import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import {
  Assistant, CropAdvisor, CropDetails, CropLibrary, Dashboard,
  DisasterPlaybooks, GenericPage, LocationSelect, Login, Mandi,
  MyFarm, Notifications, PestDisease, Relief, RiskRadar, Schemes, Weather,
} from './pages/KisanPages';

/** Redirects to /login if the user has never completed onboarding. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const name = localStorage.getItem('kisansetu_name');
  const lat  = localStorage.getItem('kisansetu_lat');
  const lng  = localStorage.getItem('kisansetu_lng');
  const loc  = useLocation();

  // Always allow login and location pages through
  if (loc.pathname === '/login' || loc.pathname === '/location') return <>{children}</>;

  // Must have completed identity step (name) first
  if (!name) return <Navigate to="/login" replace state={{ from: loc }} />;

  // Must have set a real location
  if (!lat || !lng || lat === '0' || lng === '0')
    return <Navigate to="/login" replace state={{ from: loc, step: 2 }} />;

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <RequireAuth>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"         element={<Dashboard />} />
            <Route path="/crop-advisor"      element={<CropAdvisor />} />
            <Route path="/crops"             element={<CropLibrary />} />
            <Route path="/crops/:id"         element={<CropDetails />} />
            <Route path="/weather"           element={<Weather />} />
            <Route path="/risk-radar"        element={<RiskRadar />} />
            <Route path="/disaster-playbooks" element={<DisasterPlaybooks />} />
            <Route path="/pest-disease"      element={<PestDisease />} />
            <Route path="/mandi"             element={<Mandi />} />
            <Route path="/schemes"           element={<Schemes />} />
            <Route path="/insurance"         element={<GenericPage title="Insurance claim assistance" />} />
            <Route path="/relief"            element={<Relief />} />
            <Route path="/my-farm"           element={<MyFarm />} />
            <Route path="/notifications"     element={<Notifications />} />
            <Route path="/settings"          element={<GenericPage title="Settings" />} />
            <Route path="/assistant"         element={<Assistant />} />
            <Route path="/login"             element={<Login />} />
            <Route path="/location"          element={<LocationSelect />} />
          </Routes>
        </RequireAuth>
      </Layout>
    </BrowserRouter>
  );
}
