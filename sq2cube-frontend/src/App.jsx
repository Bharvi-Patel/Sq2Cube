import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header         from "./components/Header";
import Footer         from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home           from "./pages/Home";
import Upload         from "./pages/Upload";
import History        from "./pages/History";
import Login          from "./pages/Login";
import Signup         from "./pages/Signup";
import Profile        from "./pages/Profile";
import ForgetPass     from "./pages/ForgetPass.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword  from "./pages/ResetPassword.jsx";
import ProfileSetup   from "./pages/ProfileSetup.jsx";
import Explore        from "./pages/Explore.jsx";
import AboutUs        from "./pages/AboutUs.jsx";
import ContactUs      from "./pages/ContactUs.jsx";
import Help           from "./pages/Help.jsx";
import OAuthSuccess   from "./pages/OAuthSuccess.jsx";
import AdminPanel     from "./pages/AdminPanel.jsx";
import MaintenanceGate    from "./components/MaintenanceGate.jsx";

function App() {
  return (
    <Router>
      <Header />

      <MaintenanceGate>
      <div style={{ minHeight: "80vh", display: "block" }}>
        <Routes>

          {/* Public */}
          <Route path="/"                element={<Home />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/signup"          element={<Signup />} />
          <Route path="/forgetPass"      element={<ForgetPass />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/oauth-success"   element={<OAuthSuccess />} />
          <Route path="/profileSetup"    element={<ProfileSetup />} />
          <Route path="/explore"          element={<Explore />} />
          <Route path="/about"          element={<AboutUs />} />
          <Route path="/contact"        element={<ContactUs />} />
          <Route path="/help"             element={<Help />} />

          {/* Protected */}
          <Route path="/upload"  element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin"   element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />

        </Routes>
      </div>
      </MaintenanceGate>
      
      <Footer />
    </Router>
  );
}

export default App;