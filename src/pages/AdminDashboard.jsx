import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Calendar, FileText, HelpCircle, Check, X, Shield, Plus, BarChart2, Image, Upload, Award, GraduationCap, Layers, Briefcase, Trash2 } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function AdminDashboard() {
  const [activeModule, setActiveModule] = useState('overview')
  const [pendingAlumni, setPendingAlumni] = useState([])
  const [queries, setQueries] = useState([])
  const [stats, setStats] = useState({ alumniCount: 0, eventCount: 0, queryCount: 0 })
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Form States
  const [eventForm, setEventForm] = useState({ title: '', description: '', event_date: '', location: '', image_url: '' })
  const [newsForm, setNewsForm] = useState({ title: '', category: 'Reunion', content: '', excerpt: '', thumbnail_url: '', pdf_url: '' })
  const [galleryForm, setGalleryForm] = useState({ title: '', image_url: '', category: 'Reunion', year: '', section: 'recent' })
  const [queryReply, setQueryReply] = useState({ id: '', reply: '' })
  
  const [councilForm, setCouncilForm] = useState({ name: '', designation: '', batch: '', photo_url: '', serial_number: '', phone: '' })
  const [coordinatorForm, setCoordinatorForm] = useState({ name: '', batch: '', email: '', whatsapp: '', linkedin: '', photo_url: '' })
  const [scholarshipForm, setScholarshipForm] = useState({ title: '', description: '', eligibility: '', amount: '', deadline: '', apply_url: '' })
  const [distinguishedForm, setDistinguishedForm] = useState({ name: '', batch: '', company: '', role: '', achievements: '', photo_url: '' })

  // List States
  const [councilMembers, setCouncilMembers] = useState([])
  const [batchCoordinators, setBatchCoordinators] = useState([])
  const [scholarshipsList, setScholarshipsList] = useState([])
  const [distinguishedList, setDistinguishedList] = useState([])

  const [uploading, setUploading] = useState({ event: false, news: false, gallery: false, council: false, coordinator: false, distinguished: false })

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageUpload(file, type)
    }
  }

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      handleImageUpload(file, type)
    }
  }

  const handleImageUpload = async (file, type) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed!')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB!')
      return
    }

    setUploading(prev => ({ ...prev, [type]: true }))
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(fileName, file)

    if (uploadError) {
      alert(uploadError.message)
      setUploading(prev => ({ ...prev, [type]: false }))
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(fileName)

    if (type === 'event') {
      setEventForm(prev => ({ ...prev, image_url: publicUrl }))
    } else if (type === 'news') {
      setNewsForm(prev => ({ ...prev, thumbnail_url: publicUrl }))
    } else if (type === 'gallery') {
      setGalleryForm(prev => ({ ...prev, image_url: publicUrl }))
    } else if (type === 'council') {
      setCouncilForm(prev => ({ ...prev, photo_url: publicUrl }))
    } else if (type === 'coordinator') {
      setCoordinatorForm(prev => ({ ...prev, photo_url: publicUrl }))
    } else if (type === 'distinguished') {
      setDistinguishedForm(prev => ({ ...prev, photo_url: publicUrl }))
    }

    setUploading(prev => ({ ...prev, [type]: false }))
  }

  const fetchCouncilMembers = async () => {
    const { data } = await supabase.from('council_members').select('*').order('serial_number', { ascending: true })
    setCouncilMembers(data || [])
  }
  const fetchBatchCoordinators = async () => {
    const { data } = await supabase.from('batch_coordinators').select('*').order('batch', { ascending: false })
    setBatchCoordinators(data || [])
  }
  const fetchScholarships = async () => {
    const { data } = await supabase.from('scholarships').select('*').order('created_at', { ascending: false })
    setScholarshipsList(data || [])
  }
  const fetchDistinguished = async () => {
    const { data } = await supabase.from('distinguished_alumni').select('*').order('created_at', { ascending: false })
    setDistinguishedList(data || [])
  }

  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is admin
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login')
        return
      }
      
      supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({ data }) => {
          if (data?.is_admin) {
            setIsAdmin(true)
            fetchAdminData()
          } else {
            alert('Access Denied: Admin privileges required.')
            navigate('/')
          }
        })
    })
  }, [navigate])

  const fetchAdminData = async () => {
    setLoading(true)
    
    // 1. Pending Alumni
    const { data: alumni } = await supabase.from('profiles').select('*').eq('approved', false)
    setPendingAlumni(alumni || [])

    // 2. User Queries
    const { data: qlist } = await supabase.from('queries').select('*, profiles(full_name)').order('created_at', { ascending: false })
    setQueries(qlist || [])

    // 3. Stats
    const { count: totalAlumni } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: totalEvents } = await supabase.from('events').select('*', { count: 'exact', head: true })
    const { count: totalQueries } = await supabase.from('queries').select('*', { count: 'exact', head: true }).eq('status', 'pending')

    setStats({
      alumniCount: totalAlumni || 0,
      eventCount: totalEvents || 0,
      queryCount: totalQueries || 0
    })

    // Fetch lists for our new modules
    await Promise.all([
      fetchCouncilMembers(),
      fetchBatchCoordinators(),
      fetchScholarships(),
      fetchDistinguished()
    ])

    setLoading(false)
  }

  const handleCreateCouncilMember = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('council_members').insert({
      ...councilForm,
      serial_number: councilForm.serial_number ? parseInt(councilForm.serial_number) : null
    })
    if (!error) {
      alert('Council member added successfully!')
      setCouncilForm({ name: '', designation: '', batch: '', photo_url: '', serial_number: '', phone: '' })
      fetchCouncilMembers()
    } else {
      alert(error.message)
    }
  }

  const handleDeleteCouncilMember = async (id) => {
    if (!confirm('Are you sure you want to delete this council member?')) return
    const { error } = await supabase.from('council_members').delete().eq('id', id)
    if (!error) {
      alert('Council member deleted successfully!')
      fetchCouncilMembers()
    } else {
      alert(error.message)
    }
  }

  const handleCreateCoordinator = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('batch_coordinators').insert(coordinatorForm)
    if (!error) {
      alert('Batch coordinator added successfully!')
      setCoordinatorForm({ name: '', batch: '', email: '', whatsapp: '', linkedin: '', photo_url: '' })
      fetchBatchCoordinators()
    } else {
      alert(error.message)
    }
  }

  const handleDeleteCoordinator = async (id) => {
    if (!confirm('Are you sure you want to delete this coordinator?')) return
    const { error } = await supabase.from('batch_coordinators').delete().eq('id', id)
    if (!error) {
      alert('Batch coordinator deleted successfully!')
      fetchBatchCoordinators()
    } else {
      alert(error.message)
    }
  }

  const handleCreateScholarship = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('scholarships').insert(scholarshipForm)
    if (!error) {
      alert('Scholarship created successfully!')
      setScholarshipForm({ title: '', description: '', eligibility: '', amount: '', deadline: '', apply_url: '' })
      fetchScholarships()
    } else {
      alert(error.message)
    }
  }

  const handleDeleteScholarship = async (id) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return
    const { error } = await supabase.from('scholarships').delete().eq('id', id)
    if (!error) {
      alert('Scholarship deleted successfully!')
      fetchScholarships()
    } else {
      alert(error.message)
    }
  }

  const handleCreateDistinguished = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('distinguished_alumni').insert(distinguishedForm)
    if (!error) {
      alert('Distinguished alumnus added successfully!')
      setDistinguishedForm({ name: '', batch: '', company: '', role: '', achievements: '', photo_url: '' })
      fetchDistinguished()
    } else {
      alert(error.message)
    }
  }

  const handleDeleteDistinguished = async (id) => {
    if (!confirm('Are you sure you want to delete this distinguished alumnus?')) return
    const { error } = await supabase.from('distinguished_alumni').delete().eq('id', id)
    if (!error) {
      alert('Distinguished alumnus deleted successfully!')
      fetchDistinguished()
    } else {
      alert(error.message)
    }
  }

  const handleApproveAlumni = async (id) => {
    const { error } = await supabase.from('profiles').update({ approved: true }).eq('id', id)
    if (!error) {
      alert('Alumni approved successfully!')
      fetchAdminData()
    }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('events').insert(eventForm)
    if (!error) {
      alert('Event created successfully!')
      setEventForm({ title: '', description: '', event_date: '', location: '', image_url: '' })
      fetchAdminData()
    }
  }

  const handleCreateNews = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('news').insert(newsForm)
    if (!error) {
      alert('News published successfully!')
      setNewsForm({ title: '', category: 'Reunion', content: '', excerpt: '', thumbnail_url: '', pdf_url: '' })
      fetchAdminData()
    }
  }

  const handleCreateGallery = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('gallery').insert(galleryForm)
    if (!error) {
      alert('Gallery item uploaded successfully!')
      setGalleryForm({ title: '', image_url: '', category: 'Reunion', year: '', section: 'recent' })
      fetchAdminData()
    }
  }

  const handleReplyQuery = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('queries').update({
      reply: queryReply.reply,
      status: 'resolved'
    }).eq('id', queryReply.id)

    if (!error) {
      alert('Reply sent successfully!')
      setQueryReply({ id: '', reply: '' })
      fetchAdminData()
    }
  }

  if (loading || !isAdmin) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-sm h-fit space-y-2">
        <div className="flex items-center space-x-2 text-primary font-heading font-extrabold mb-6 border-b border-gray-100 pb-3">
          <Shield className="h-6 w-6 text-secondary" />
          <span>Admin Portal</span>
        </div>
        <button
          onClick={() => setActiveModule('overview')}
          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeModule === 'overview' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <BarChart2 className="h-5 w-5" />
          <span>Overview Stats</span>
        </button>
        <button
          onClick={() => setActiveModule('alumni')}
          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeModule === 'alumni' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users className="h-5 w-5" />
          <span>Approve Alumni ({pendingAlumni.length})</span>
        </button>
        <button
          onClick={() => setActiveModule('events')}
          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeModule === 'events' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span>Create Event</span>
        </button>
        <button
          onClick={() => setActiveModule('news')}
          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeModule === 'news' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FileText className="h-5 w-5" />
          <span>Publish News</span>
        </button>
        <button
          onClick={() => setActiveModule('gallery')}
          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeModule === 'gallery' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Image className="h-5 w-5" />
          <span>Add Gallery Media</span>
        </button>
        <button
          onClick={() => setActiveModule('queries')}
          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeModule === 'queries' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HelpCircle className="h-5 w-5" />
          <span>User Queries ({queries.filter(q => q.status === 'pending').length})</span>
        </button>
        <button
          onClick={() => setActiveModule('manage_council')}
          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeModule === 'manage_council' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Layers className="h-5 w-5" />
          <span>Manage Council</span>
        </button>
        <button
          onClick={() => setActiveModule('manage_coordinators')}
          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeModule === 'manage_coordinators' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Briefcase className="h-5 w-5" />
          <span>Manage Coordinators</span>
        </button>
        <button
          onClick={() => setActiveModule('manage_scholarships')}
          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeModule === 'manage_scholarships' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <GraduationCap className="h-5 w-5" />
          <span>Manage Scholarships</span>
        </button>
        <button
          onClick={() => setActiveModule('manage_distinguished')}
          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeModule === 'manage_distinguished' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Award className="h-5 w-5" />
          <span>Manage Distinguished</span>
        </button>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 bg-white border border-[#E0E0E0] rounded-lg p-8 shadow-sm">
        {/* Module: Overview */}
        {activeModule === 'overview' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-xl text-primary border-b pb-3">Dashboard Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#f9f9fd] p-6 rounded-lg border flex flex-col items-center">
                <Users className="h-8 w-8 text-secondary mb-2" />
                <span className="text-2xl font-bold text-primary">{stats.alumniCount}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Total Profiles</span>
              </div>
              <div className="bg-[#f9f9fd] p-6 rounded-lg border flex flex-col items-center">
                <Calendar className="h-8 w-8 text-secondary mb-2" />
                <span className="text-2xl font-bold text-primary">{stats.eventCount}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Total Events</span>
              </div>
              <div className="bg-[#f9f9fd] p-6 rounded-lg border flex flex-col items-center">
                <HelpCircle className="h-8 w-8 text-secondary mb-2" />
                <span className="text-2xl font-bold text-primary">{stats.queryCount}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Pending Queries</span>
              </div>
            </div>
          </div>
        )}

        {/* Module: Alumni Approvals */}
        {activeModule === 'alumni' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-xl text-primary border-b pb-3">Pending Registrations</h2>
            {pendingAlumni.length === 0 ? (
              <p className="text-sm text-gray-500">No pending registrations at this time.</p>
            ) : (
              <div className="space-y-4">
                {pendingAlumni.map((alum) => (
                  <div key={alum.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-primary">{alum.full_name}</h4>
                      <p className="text-xs text-gray-500">Batch {alum.batch} | ID: {alum.student_id || 'N/A'}</p>
                      <p className="text-xs text-gray-400 mt-1">{alum.degree} in {alum.major}</p>
                    </div>
                    <button
                      onClick={() => handleApproveAlumni(alum.id)}
                      className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-semibold"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      <span>Approve</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Module: Create Event */}
        {activeModule === 'events' && (
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <h2 className="font-heading font-bold text-xl text-primary border-b pb-3">Create Upcoming Event</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Event Title</label>
              <input
                type="text"
                required
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <textarea
                required
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                rows="4"
                className="w-full border border-gray-300 rounded-md p-3 outline-none text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Event Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={eventForm.event_date}
                  onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Event Image (Drag & Drop or Click to Select)</label>
              <label
                htmlFor="event-image-upload"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'event')}
                className="mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer block"
              >
                {eventForm.image_url ? (
                  <div className="text-center space-y-2 pointer-events-none">
                    <img src={eventForm.image_url} alt="Event Preview" className="w-full max-h-48 object-cover rounded-md border mx-auto" />
                    <p className="text-xxs text-green-600 font-semibold">Upload complete! Click to change.</p>
                  </div>
                ) : (
                  <div className="space-y-2 text-center pointer-events-none">
                    <Upload className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="text-xs text-gray-500">Drag & drop your picture here, or click to upload</p>
                    <p className="text-xxs text-gray-400">PNG, JPG, JPEG under 2MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'event')}
                  className="hidden"
                  id="event-image-upload"
                />
              </label>
            </div>
            <button type="submit" className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              <span>Create Event</span>
            </button>
          </form>
        )}

        {/* Module: Publish News */}
        {activeModule === 'news' && (
          <form onSubmit={handleCreateNews} className="space-y-4">
            <h2 className="font-heading font-bold text-xl text-primary border-b pb-3">Publish News Article / Newsletter</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                <select
                  value={newsForm.category}
                  onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm bg-white"
                >
                  <option value="Reunion">Reunion</option>
                  <option value="Campus">Campus</option>
                  <option value="Achievement">Achievement</option>
                  <option value="Newsletter">Newsletter</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Short Excerpt (Grid Summary)</label>
              <input
                type="text"
                required
                value={newsForm.excerpt}
                onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Article Content</label>
              <textarea
                required
                value={newsForm.content}
                onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                rows="4"
                className="w-full border border-gray-300 rounded-md p-3 outline-none text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Thumbnail Image (Drag & Drop or Click to Select)</label>
                <label
                  htmlFor="news-image-upload"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'news')}
                  className="mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer block"
                >
                  {newsForm.thumbnail_url ? (
                    <div className="text-center space-y-2 pointer-events-none">
                      <img src={newsForm.thumbnail_url} alt="News Preview" className="w-full max-h-48 object-cover rounded-md border mx-auto" />
                      <p className="text-xxs text-green-600 font-semibold">Upload complete! Click to change.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center pointer-events-none">
                      <Upload className="mx-auto h-10 w-10 text-gray-400" />
                      <p className="text-xs text-gray-500">Drag & drop your picture here, or click to upload</p>
                      <p className="text-xxs text-gray-400">PNG, JPG, JPEG under 2MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'news')}
                    className="hidden"
                    id="news-image-upload"
                  />
                </label>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">PDF Newsletter Link (Optional)</label>
                <input
                  type="text"
                  value={newsForm.pdf_url}
                  onChange={(e) => setNewsForm({ ...newsForm, pdf_url: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                />
              </div>
            </div>
            <button type="submit" className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              <span>Publish News</span>
            </button>
          </form>
        )}

        {/* Module: Add Gallery */}
        {activeModule === 'gallery' && (
          <form onSubmit={handleCreateGallery} className="space-y-4">
            <h2 className="font-heading font-bold text-xl text-primary border-b pb-3">Add Gallery Photo / Video</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Media Title</label>
              <input
                type="text"
                required
                value={galleryForm.title}
                onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 items-end">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Image / Media File (Drag & Drop or Click to Select)</label>
                <label
                  htmlFor="gallery-image-upload"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'gallery')}
                  className="mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer block"
                >
                  {galleryForm.image_url ? (
                    <div className="text-center space-y-2 pointer-events-none">
                      <img src={galleryForm.image_url} alt="Gallery Preview" className="w-full max-h-48 object-cover rounded-md border mx-auto" />
                      <p className="text-xxs text-green-600 font-semibold">Upload complete! Click to change.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center pointer-events-none">
                      <Upload className="mx-auto h-10 w-10 text-gray-400" />
                      <p className="text-xs text-gray-500">Drag & drop your picture here, or click to upload</p>
                      <p className="text-xxs text-gray-400">PNG, JPG, JPEG under 2MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'gallery')}
                    className="hidden"
                    id="gallery-image-upload"
                  />
                </label>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Year</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2024"
                  value={galleryForm.year}
                  onChange={(e) => setGalleryForm({ ...galleryForm, year: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                <select
                  value={galleryForm.category}
                  onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm bg-white"
                >
                  <option value="Reunion">Reunion</option>
                  <option value="Sports">Sports</option>
                  <option value="Campus">Campus</option>
                  <option value="Ceremony">Ceremony</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Gallery Section</label>
                <select
                  value={galleryForm.section}
                  onChange={(e) => setGalleryForm({ ...galleryForm, section: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm bg-white"
                >
                  <option value="recent">Recent Activities</option>
                  <option value="memories_archives">Memories & Archives</option>
                </select>
              </div>
            </div>
            <button type="submit" className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              <span>Add Media</span>
            </button>
          </form>
        )}

        {/* Module: User Queries */}
        {activeModule === 'queries' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-xl text-primary border-b pb-3">User Support Queries</h2>
            {queries.length === 0 ? (
              <p className="text-sm text-gray-500">No support queries found.</p>
            ) : (
              <div className="space-y-6">
                {queries.map((q) => (
                  <div key={q.id} className="border border-gray-200 rounded-lg p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-xxs font-semibold uppercase ${
                          q.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {q.status}
                        </span>
                        <h4 className="font-heading font-bold text-sm text-primary mt-1">{q.subject}</h4>
                        <p className="text-xxs text-gray-400">From: {q.profiles?.full_name || 'Alumni Member'} | {new Date(q.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="font-body text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-md">{q.message}</p>
                    
                    {q.reply ? (
                      <div className="bg-red-50 border border-red-100 p-3 rounded-md">
                        <span className="text-xxs font-bold text-primary block mb-1">Official Reply:</span>
                        <p className="font-body text-xs text-red-800">{q.reply}</p>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleReplyQuery()
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          required
                          placeholder="Type your official reply..."
                          value={queryReply.id === q.id ? queryReply.reply : ''}
                          onChange={(e) => setQueryReply({ id: q.id, reply: e.target.value })}
                          className="flex-grow border border-gray-300 rounded-md px-3 py-1 outline-none text-xs"
                        />
                        <button type="submit" onClick={() => setQueryReply({ ...queryReply, id: q.id })} className="bg-primary hover:bg-primary-dark text-white rounded-md px-4 py-1 text-xs font-semibold flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          <span>Send Reply</span>
                        </button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Module: Manage Council */}
        {activeModule === 'manage_council' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-xl text-primary border-b pb-3">Manage Council Members</h2>
            <form onSubmit={handleCreateCouncilMember} className="space-y-4">
              <h3 className="font-heading font-bold text-sm text-secondary">Add New Council Member</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={councilForm.name}
                    onChange={(e) => setCouncilForm({ ...councilForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. President, Secretary"
                    value={councilForm.designation}
                    onChange={(e) => setCouncilForm({ ...councilForm, designation: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Batch Year (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 2010"
                    value={councilForm.batch}
                    onChange={(e) => setCouncilForm({ ...councilForm, batch: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Serial Number (For Ordering)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1"
                    value={councilForm.serial_number}
                    onChange={(e) => setCouncilForm({ ...councilForm, serial_number: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 ... or choose not to display"
                    value={councilForm.phone}
                    onChange={(e) => setCouncilForm({ ...councilForm, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Member Photo (Drag & Drop or Click to Select)</label>
                <label
                  htmlFor="council-image-upload"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'council')}
                  className="mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer block"
                >
                  {uploading.council ? (
                    <div className="text-center space-y-2 pointer-events-none">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
                      <p className="text-xxs text-gray-500 font-semibold">Uploading...</p>
                    </div>
                  ) : councilForm.photo_url ? (
                    <div className="text-center space-y-2 pointer-events-none">
                      <img src={councilForm.photo_url} alt="Member Preview" className="w-20 h-20 rounded-full object-cover border mx-auto" />
                      <p className="text-xxs text-green-600 font-semibold">Upload complete! Click to change.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center pointer-events-none">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-xs text-gray-500">Drag & drop photo here, or click to upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'council')}
                    className="hidden"
                    id="council-image-upload"
                  />
                </label>
              </div>
              <button type="submit" className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Member</span>
              </button>
            </form>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-heading font-bold text-sm text-primary mb-4">Existing Council Members</h3>
              {councilMembers.length === 0 ? (
                <p className="text-xs text-gray-500">No council members added in database. Displaying default static list on frontend.</p>
              ) : (
                <div className="space-y-3">
                  {councilMembers.map((m) => (
                    <div key={m.id} className="flex justify-between items-center border border-gray-100 p-3 rounded-md">
                      <div className="flex items-center space-x-3">
                        {m.photo_url ? (
                          <img src={m.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">?</div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-primary">{m.name}</p>
                          <p className="text-xxs text-gray-500">{m.designation} {m.batch && `| Batch: ${m.batch}`} | Order: {m.serial_number || 'N/A'} {m.phone && `| Phone: ${m.phone}`}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteCouncilMember(m.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Module: Manage Coordinators */}
        {activeModule === 'manage_coordinators' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-xl text-primary border-b pb-3">Manage Batch Coordinators</h2>
            <form onSubmit={handleCreateCoordinator} className="space-y-4">
              <h3 className="font-heading font-bold text-sm text-secondary">Add New Coordinator</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={coordinatorForm.name}
                    onChange={(e) => setCoordinatorForm({ ...coordinatorForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Batch Year</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2024"
                    value={coordinatorForm.batch}
                    onChange={(e) => setCoordinatorForm({ ...coordinatorForm, batch: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={coordinatorForm.email}
                    onChange={(e) => setCoordinatorForm({ ...coordinatorForm, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp / Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765..."
                    value={coordinatorForm.whatsapp}
                    onChange={(e) => setCoordinatorForm({ ...coordinatorForm, whatsapp: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={coordinatorForm.linkedin}
                    onChange={(e) => setCoordinatorForm({ ...coordinatorForm, linkedin: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Coordinator Photo (Drag & Drop or Click to Select)</label>
                <label
                  htmlFor="coordinator-image-upload"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'coordinator')}
                  className="mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer block"
                >
                  {uploading.coordinator ? (
                    <div className="text-center space-y-2 pointer-events-none">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
                      <p className="text-xxs text-gray-500 font-semibold">Uploading...</p>
                    </div>
                  ) : coordinatorForm.photo_url ? (
                    <div className="text-center space-y-2 pointer-events-none">
                      <img src={coordinatorForm.photo_url} alt="Coordinator Preview" className="w-16 h-16 rounded-full object-cover border mx-auto" />
                      <p className="text-xxs text-green-600 font-semibold">Upload complete! Click to change.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center pointer-events-none">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-xs text-gray-500">Drag & drop photo here, or click to upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'coordinator')}
                    className="hidden"
                    id="coordinator-image-upload"
                  />
                </label>
              </div>
              <button type="submit" className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Coordinator</span>
              </button>
            </form>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-heading font-bold text-sm text-primary mb-4">Existing Batch Coordinators</h3>
              {batchCoordinators.length === 0 ? (
                <p className="text-xs text-gray-500">No coordinators added in database. Displaying default static list on frontend.</p>
              ) : (
                <div className="space-y-3">
                  {batchCoordinators.map((c) => (
                    <div key={c.id} className="flex justify-between items-center border border-gray-100 p-3 rounded-md">
                      <div className="flex items-center space-x-3">
                        {c.photo_url ? (
                          <img src={c.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">?</div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-primary">{c.name}</p>
                          <p className="text-xxs text-gray-500">Class of {c.batch} | {c.email || 'No email'}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteCoordinator(c.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Module: Manage Scholarships */}
        {activeModule === 'manage_scholarships' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-xl text-primary border-b pb-3">Manage Scholarships</h2>
            <form onSubmit={handleCreateScholarship} className="space-y-4">
              <h3 className="font-heading font-bold text-sm text-secondary">Create New Scholarship Opportunity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Scholarship Title</label>
                  <input
                    type="text"
                    required
                    value={scholarshipForm.title}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Amount / Reward Value</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹50,000 / Full Tuition"
                    value={scholarshipForm.amount}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, amount: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Deadline / Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Oct 15, 2026"
                    value={scholarshipForm.deadline}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, deadline: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Application URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={scholarshipForm.apply_url}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, apply_url: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  placeholder="e.g. Science stream graduates, GPA above 3.8"
                  value={scholarshipForm.eligibility}
                  onChange={(e) => setScholarshipForm({ ...scholarshipForm, eligibility: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  value={scholarshipForm.description}
                  onChange={(e) => setScholarshipForm({ ...scholarshipForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-3 outline-none text-sm"
                />
              </div>
              <button type="submit" className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                <span>Create Scholarship</span>
              </button>
            </form>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-heading font-bold text-sm text-primary mb-4">Existing Scholarships</h3>
              {scholarshipsList.length === 0 ? (
                <p className="text-xs text-gray-500">No scholarships available in database.</p>
              ) : (
                <div className="space-y-3">
                  {scholarshipsList.map((s) => (
                    <div key={s.id} className="flex justify-between items-center border border-gray-100 p-3 rounded-md">
                      <div>
                        <p className="text-sm font-bold text-primary">{s.title}</p>
                        <p className="text-xxs text-gray-500">{s.amount || 'No value specified'} | Deadline: {s.deadline || 'N/A'}</p>
                      </div>
                      <button onClick={() => handleDeleteScholarship(s.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Module: Manage Distinguished */}
        {activeModule === 'manage_distinguished' && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-xl text-primary border-b pb-3">Manage Distinguished Alumni</h2>
            <form onSubmit={handleCreateDistinguished} className="space-y-4">
              <h3 className="font-heading font-bold text-sm text-secondary">Add Distinguished Alumnus</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={distinguishedForm.name}
                    onChange={(e) => setDistinguishedForm({ ...distinguishedForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Batch Year</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2008"
                    value={distinguishedForm.batch}
                    onChange={(e) => setDistinguishedForm({ ...distinguishedForm, batch: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Job Role / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Researcher, CEO"
                    value={distinguishedForm.role}
                    onChange={(e) => setDistinguishedForm({ ...distinguishedForm, role: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Company / Institution</label>
                  <input
                    type="text"
                    placeholder="e.g. Google, MIT"
                    value={distinguishedForm.company}
                    onChange={(e) => setDistinguishedForm({ ...distinguishedForm, company: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Key Achievements</label>
                <textarea
                  required
                  rows="2"
                  placeholder="Summarize awards, milestones, or contributions..."
                  value={distinguishedForm.achievements}
                  onChange={(e) => setDistinguishedForm({ ...distinguishedForm, achievements: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-3 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Alumnus Photo (Drag & Drop or Click to Select)</label>
                <label
                  htmlFor="distinguished-image-upload"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'distinguished')}
                  className="mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer block"
                >
                  {uploading.distinguished ? (
                    <div className="text-center space-y-2 pointer-events-none">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
                      <p className="text-xxs text-gray-500 font-semibold">Uploading...</p>
                    </div>
                  ) : distinguishedForm.photo_url ? (
                    <div className="text-center space-y-2 pointer-events-none">
                      <img src={distinguishedForm.photo_url} alt="Distinguished Preview" className="w-16 h-16 rounded-full object-cover border mx-auto" />
                      <p className="text-xxs text-green-600 font-semibold">Upload complete! Click to change.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center pointer-events-none">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-xs text-gray-500">Drag & drop photo here, or click to upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'distinguished')}
                    className="hidden"
                    id="distinguished-image-upload"
                  />
                </label>
              </div>
              <button type="submit" className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Alumnus</span>
              </button>
            </form>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-heading font-bold text-sm text-primary mb-4">Existing Distinguished Alumni</h3>
              {distinguishedList.length === 0 ? (
                <p className="text-xs text-gray-500">No distinguished alumni in database. Displaying default static list on frontend.</p>
              ) : (
                <div className="space-y-3">
                  {distinguishedList.map((d) => (
                    <div key={d.id} className="flex justify-between items-center border border-gray-100 p-3 rounded-md">
                      <div className="flex items-center space-x-3">
                        {d.photo_url ? (
                          <img src={d.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">?</div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-primary">{d.name}</p>
                          <p className="text-xxs text-gray-500">Class of {d.batch} | {d.role} at {d.company}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteDistinguished(d.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
