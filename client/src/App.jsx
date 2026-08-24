import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import Listings from './pages/Listings';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />

        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/listings" element={<Listings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;