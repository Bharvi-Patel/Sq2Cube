import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Upload from "./pages/Upload";
import History from "./pages/History";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import ForgetPass from "./pages/ForgetPass.jsx";
import ProfileSetup from "./pages/ProfileSetup.jsx";  

import GeneratorPage from "./components/upload/GeneratorPage"; 

import Robot from "./components/upload/Robot";

function App() {
  return (
    <Router>
      <Header />

      <div style={{ minHeight: "80vh", padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          
          <Route path="/generator" element={<GeneratorPage />} />
          <Route path="/robot" element={<Robot />} />
          <Route path="/history" element={<History />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element
          ={<Profile />} />
          <Route path="/forgetPass" element={<ForgetPass/>} />
          <Route path="/profileSetup" element={<ProfileSetup />} />
        </Routes>
      </div>

      <Footer />
    </Router>
  );
}

export default App;