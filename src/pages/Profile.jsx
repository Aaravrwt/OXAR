import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Briefcase, BookOpen, Save, ShieldAlert, Upload } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState({
    full_name: '',
    batch: '',
    degree: '',
    major: '',
    student_id: '',
    job_title: '',
    company: '',
    avatar_url: '',
    approved: false,
  })
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login')
      } else {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    })
  }, [navigate])

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setProfile(data)
    }
    setLoading(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleFileUpload = async (file) => {
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
      .from('avatars')
      .upload(fileName, file)

    if (uploadError) {
      alert(uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
    setUploading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        batch: profile.batch,
        degree: profile.degree,
        major: profile.major,
        student_id: profile.student_id,
        job_title: profile.job_title,
        company: profile.company,
        avatar_url: profile.avatar_url
      })
      .eq('id', user.id)

    setSaving(false)
    if (!error) {
      alert('Profile updated successfully!')
    } else {
      alert(error.message)
    }
  }

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white border border-[#E0E0E0] rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-[#E0E0E0] px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover border" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="font-heading font-extrabold text-xl text-primary">{profile.full_name || 'Alumni Member'}</h1>
              <p className="font-body text-xs text-gray-500">Batch {profile.batch || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center">
            {profile.approved ? (
              <span className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-full px-3 py-1">
                Verified Account
              </span>
            ) : (
              <span className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold rounded-full px-3 py-1 flex items-center">
                <ShieldAlert className="h-3 w-3 mr-1" />
                Pending Approval
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-sm text-primary flex items-center border-b border-gray-100 pb-2">
              <User className="h-4 w-4 mr-2 text-secondary" />
              <span>Personal Details</span>
            </h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={profile.full_name || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Profile Picture (Drag & Drop or Click to Select)</label>
              <label
                htmlFor="profile-avatar-upload"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer block"
              >
                {profile.avatar_url ? (
                  <div className="text-center space-y-2 pointer-events-none">
                    <img src={profile.avatar_url} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover mx-auto border" />
                    <p className="text-xxs text-green-600 font-semibold">Change Profile Picture</p>
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
                  onChange={handleFileSelect}
                  className="hidden"
                  id="profile-avatar-upload"
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading font-bold text-sm text-primary flex items-center border-b border-gray-100 pb-2">
              <BookOpen className="h-4 w-4 mr-2 text-secondary" />
              <span>Graduation Details</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Batch Year</label>
                <input
                  type="text"
                  name="batch"
                  value={profile.batch || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Student ID</label>
                <input
                  type="text"
                  name="student_id"
                  value={profile.student_id || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Degree</label>
                <input
                  type="text"
                  name="degree"
                  value={profile.degree || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Major / Stream</label>
                <input
                  type="text"
                  name="major"
                  value={profile.major || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading font-bold text-sm text-primary flex items-center border-b border-gray-100 pb-2">
              <Briefcase className="h-4 w-4 mr-2 text-secondary" />
              <span>Professional Details</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Job Title</label>
                <input
                  type="text"
                  name="job_title"
                  value={profile.job_title || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  value={profile.company || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark shadow-sm transition-all"
            >
              <Save className="h-4 w-4 mr-2" />
              <span>{saving ? 'Saving...' : uploading ? 'Uploading...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
