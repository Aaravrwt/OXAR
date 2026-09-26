import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import AlumniDirectory from './pages/AlumniDirectory'
import Events from './pages/Events'
import News from './pages/News'
import SocialFeed from './pages/SocialFeed'
import Join from './pages/Join'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import FAQ from './pages/FAQ'
import Profile from './pages/Profile'
import Council from './pages/Council'
import Coordinators from './pages/Coordinators'
import Scholarships from './pages/Scholarships'
import DistinguishedAlumni from './pages/DistinguishedAlumni'
import Gallery from './pages/Gallery'
import Careers from './pages/Careers'
import BusinessDirectory from './pages/BusinessDirectory'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

export default function App() {
  useEffect(() => {
    // Detect if recovery/access token is in hash (e.g. redirected from password recovery email)
    const hash = window.location.hash
    if (hash && (hash.includes('access_token=') || hash.includes('type=recovery'))) {
      window.location.href = `${window.location.origin}/reset-password${window.location.hash}`
    }
  }, [])
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/directory" element={<AlumniDirectory />} />
          <Route path="/events" element={<Events />} />
          <Route path="/news" element={<News />} />
          <Route path="/feed" element={<SocialFeed />} />
          <Route path="/join" element={<Join />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/council" element={<Council />} />
          <Route path="/coordinators" element={<Coordinators />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/distinguished" element={<DistinguishedAlumni />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/business-directory" element={<BusinessDirectory />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Layout>
    </Router>
  )
}
