import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import Header from "@/components/layout/Header";
import Home from "@/pages/Home";
import { SignIn } from "@/pages/SignIn";
import { SignUp } from "@/pages/SignUp";
import { Dashboard } from "@/pages/Dashboard";
import { AnalysisDetail } from "@/pages/AnalysisDetail";
import { Resumes } from "@/pages/Resumes";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Layout wrapper component
const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Outlet />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes with header */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Auth routes without header */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes with header */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resumes" element={<Resumes />} />
            <Route path="/analysis/:id" element={<AnalysisDetail />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
