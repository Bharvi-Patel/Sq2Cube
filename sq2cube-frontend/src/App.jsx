import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header        from "./components/Header";
import Footer        from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home         from "./pages/Home";
import Upload       from "./pages/Upload";
import History      from "./pages/History";
import Login        from "./pages/Login";
import Signup       from "./pages/Signup";
import Profile      from "./pages/Profile";
import ForgetPass   from "./pages/ForgetPass.jsx";
import ProfileSetup from "./pages/ProfileSetup.jsx";

function App() {
  return (
    <Router>
      <Header />

      <div style={{ minHeight: "80vh", display: "block" }}>
        <Routes>

          {/* Public routes */}
          <Route path="/"          element={<Home />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/signup"    element={<Signup />} />
          <Route path="/forgetPass" element={<ForgetPass />} />
          <Route path="/profileSetup" element={<ProfileSetup />} />

          {/* Protected routes — redirect to /login if not logged in */}
          <Route path="/upload"  element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        </Routes>
      </div>

      <Footer />
    </Router>
  );
}

export default App;