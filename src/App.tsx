import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import TourViewer from "./pages/TourViewer";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";

// Admin Imports
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ParksList from "./pages/admin/ParksList";
import ParkEditor from "./pages/admin/ParkEditor";
import ScenesManager from "./pages/admin/ScenesManager";
import UsersList from "./pages/admin/UsersList";
import AnalyticsPage from "./pages/admin/AnalyticsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/tour/:parkId" element={<TourViewer />} />
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* Protected Admin Routes */}
              <Route path="/admin" element={<AdminGuard><AdminLayout><AdminDashboard /></AdminLayout></AdminGuard>} />
              <Route path="/admin/parks" element={<AdminGuard><AdminLayout><ParksList /></AdminLayout></AdminGuard>} />
              <Route path="/admin/parks/new" element={<AdminGuard><AdminLayout><ParkEditor /></AdminLayout></AdminGuard>} />
              <Route path="/admin/parks/:parkId" element={<AdminGuard><AdminLayout><ParkEditor /></AdminLayout></AdminGuard>} />
              <Route path="/admin/parks/:parkId/scenes" element={<AdminGuard><AdminLayout><ScenesManager /></AdminLayout></AdminGuard>} />
              <Route path="/admin/users" element={<AdminGuard><AdminLayout><UsersList /></AdminLayout></AdminGuard>} />
              <Route path="/admin/analytics" element={<AdminGuard><AdminLayout><AnalyticsPage /></AdminLayout></AdminGuard>} />
              
              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Analytics />
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
