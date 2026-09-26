import React, { useState, useEffect } from 'react'
import { Store, Plus, Filter, Search, Globe, Mail, Upload, User } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [industryFilter, setIndustryFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Form State
  const [form, setForm] = useState({
    name: '', owner_name: '', industry: 'Startup',
    location: '', services: '', description: '',
    contact_email: '', website_url: '', logo_url: ''
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    setLoading(true)
    const { data } = await supabase.from('businesses').select('*').order('created_at', { ascending: false })
    setBusinesses(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  // Filter Logic
  useEffect(() => {
    let result = businesses
    
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      result = result.filter(b => 
        b.name.toLowerCase().includes(q) || 
        b.services.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q))
      )
    }

    if (industryFilter !== 'All') {
      result = result.filter(b => b.industry === industryFilter)
    }

    if (locationFilter.trim()) {
      const loc = locationFilter.toLowerCase()
      result = result.filter(b => b.location.toLowerCase().includes(loc))
    }

    setFiltered(result)
  }, [searchTerm, industryFilter, locationFilter, businesses])

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleLogoUpload(file)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleLogoUpload(file)
    }
  }

  const handleLogoUpload = async (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed!')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB!')
      return
    }

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(fileName, file)

    if (uploadError) {
      alert(uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(fileName)

    setForm(prev => ({ ...prev, logo_url: publicUrl }))
    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Please login to promote your business!')
      return
    }
    const { error } = await supabase.from('businesses').insert({
      ...form,
      posted_by: user.id
    })
    if (!error) {
      alert('Business registered successfully!')
      setForm({
        name: '', owner_name: '', industry: 'Startup',
        location: '', services: '', description: '',
        contact_email: '', website_url: '', logo_url: ''
      })
      setShowAddForm(false)
      fetchBusinesses()
    } else {
      alert(error.message)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="text-center md:text-left">
          <h1 className="font-heading font-extrabold text-4xl text-primary tracking-tight mb-2">Alumni Business Directory</h1>
          <p className="font-body text-gray-500 max-w-xl">
            Support alumni-owned startups, local shops, and independent consulting services.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-primary hover:bg-primary-dark transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>{showAddForm ? 'View Directory' : 'Register Your Business'}</span>
        </button>
      </div>

      {showAddForm ? (
        <form onSubmit={handleSubmit} className="bg-white border border-[#E0E0E0] rounded-lg p-8 shadow-sm max-w-2xl mx-auto space-y-4">
          <h2 className="font-heading font-bold text-xl text-primary mb-4 flex items-center">
            <Store className="h-5 w-5 mr-2 text-secondary" />
            <span>Promote Your Business / Service</span>
          </h2>
          {!user ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm font-semibold">
              Please login to add your business to the directory.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Business / Company Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Owner Name (Alumni)</label>
                  <input
                    type="text"
                    required
                    value={form.owner_name}
                    onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Industry Category</label>
                  <select
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm bg-white"
                  >
                    <option value="Startup">Startup</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Local Business">Local Business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Location (City, Country)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohini, Delhi"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Website URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.website_url}
                    onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Services Offered (Short List)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Web Development, Legal Advisory, Cafe & Bakery"
                  value={form.services}
                  onChange={(e) => setForm({ ...form, services: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-3 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Company Logo (Drag & Drop or Click to Select)</label>
                <label
                  htmlFor="logo-image-upload"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer block"
                >
                  {uploading ? (
                    <div className="text-center space-y-2 pointer-events-none">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
                      <p className="text-xxs text-gray-500 font-semibold">Uploading...</p>
                    </div>
                  ) : form.logo_url ? (
                    <div className="text-center space-y-2 pointer-events-none">
                      <img src={form.logo_url} alt="Logo Preview" className="w-16 h-16 object-contain border mx-auto" />
                      <p className="text-xxs text-green-600 font-semibold">Upload complete! Click to change.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center pointer-events-none">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-xs text-gray-500">Drag & drop logo here, or click to upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="logo-image-upload"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Submit Business</span>
              </button>
            </>
          )}
        </form>
      ) : (
        <div className="space-y-6">
          {/* Search Controls */}
          <div className="bg-[#f9f9fd] border border-gray-200 rounded-lg p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-1.5 outline-none text-xs"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 outline-none text-xs"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 outline-none text-xs"
              >
                <option value="All">All Industries</option>
                <option value="Startup">Startup</option>
                <option value="Consulting">Consulting</option>
                <option value="Local Business">Local Business</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm max-w-md mx-auto">
              <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-lg text-primary mb-2">No Businesses Registered</h3>
              <p className="font-body text-sm text-gray-500">
                No alumni businesses registered at the moment. Add your business to promote it here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((biz) => (
                <div key={biz.id} className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      {biz.logo_url ? (
                        <img src={biz.logo_url} alt="" className="w-12 h-12 object-contain border rounded p-1" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center border text-gray-400 font-bold">
                          {biz.name.charAt(0)}
                        </div>
                      )}
                      <span className="bg-primary/10 text-primary text-xxs font-bold px-2 py-0.5 rounded uppercase">
                        {biz.industry}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-base text-primary leading-tight mb-1">{biz.name}</h3>
                    <p className="text-xxs font-semibold text-gray-400 mb-2">Owner: {biz.owner_name} | {biz.location}</p>
                    <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed">{biz.description}</p>
                    
                    <div className="text-xxs bg-gray-50 p-2 border rounded text-gray-600 mb-4">
                      <span className="font-bold text-primary block mb-0.5">Services:</span>
                      <span className="truncate block">{biz.services}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mt-auto border-t border-gray-100 pt-3">
                    {biz.website_url && (
                      <a
                        href={biz.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center"
                      >
                        <Globe className="h-3.5 w-3.5 mr-1" />
                        <span>Website</span>
                      </a>
                    )}
                    {biz.contact_email && (
                      <a
                        href={`mailto:${biz.contact_email}`}
                        className="text-xs font-semibold text-secondary hover:text-secondary-dark flex items-center ml-auto"
                      >
                        <Mail className="h-3.5 w-3.5 mr-1" />
                        <span>Email Contact</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
