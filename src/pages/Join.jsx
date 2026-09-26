import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, BookOpen, Briefcase, ChevronRight, ChevronLeft, Upload, Image } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Join() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Personal
    email: '',
    password: '',
    full_name: '',
    // Step 2: Graduation
    batch: '',
    degree: '',
    major: '',
    student_id: '',
    // Step 3: Professional
    job_title: '',
    company: '',
    avatar_url: ''
  })
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleNext = (e) => {
    e.preventDefault()
    setStep(prev => prev + 1)
  }

  const handlePrev = (e) => {
    e.preventDefault()
    setStep(prev => prev - 1)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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

    setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
    setUploading(false)
  }

  const handleSocialLogin = async (provider) => {
    setError('')
    const { error: oAuthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/join?step=2`
      }
    })
    if (oAuthError) {
      setError(oAuthError.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data?.user) {
      const { error: profileError } = await supabase.from('profiles').update({
        batch: formData.batch,
        degree: formData.degree,
        major: formData.major,
        student_id: formData.student_id,
        job_title: formData.job_title,
        company: formData.company,
        avatar_url: formData.avatar_url || null
      }).eq('id', data.user.id)

      if (profileError) {
        setError(profileError.message)
      } else {
        setSuccess(true)
      }
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto py-16 px-4 sm:px-6">
      <div className="bg-white border border-[#E0E0E0] rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-[#E0E0E0] px-6 py-4 flex justify-between items-center">
          <h2 className="font-heading font-bold text-lg text-primary">Join the Alumni Network</h2>
          <span className="text-xs font-semibold text-secondary">Step {step} of 3</span>
        </div>
        <div className="w-full bg-gray-200 h-1">
          <div className="bg-primary h-1 transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <form onSubmit={step === 3 ? handleSubmit : handleNext} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4 py-8">
              <div className="bg-green-100 text-green-800 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-2xl font-bold">✓</div>
              <h3 className="font-heading font-bold text-xl text-primary">Registration Submitted!</h3>
              <p className="font-body text-sm text-gray-500 max-w-sm mx-auto">
                Thank you for registering. Your details are pending approval by the OXAR Alumni association. We will notify you once approved.
              </p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
              >
                Go to Homepage
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: Personal details */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-primary font-heading font-semibold border-b border-gray-100 pb-2">
                    <User className="h-5 w-5 text-secondary" />
                    <span>Personal Details</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-xxs uppercase tracking-wider">Or Sign Up With</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('google')}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <span>Google</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('github')}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <span>GitHub</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Graduation Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-primary font-heading font-semibold border-b border-gray-100 pb-2">
                    <BookOpen className="h-5 w-5 text-secondary" />
                    <span>Graduation Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Graduation Batch</label>
                      <input
                        type="text"
                        name="batch"
                        placeholder="e.g. 2012"
                        required
                        value={formData.batch}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Student ID (Optional)</label>
                      <input
                        type="text"
                        name="student_id"
                        value={formData.student_id}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Degree Earned</label>
                    <input
                      type="text"
                      name="degree"
                      placeholder="e.g. B.Tech, High School"
                      required
                      value={formData.degree}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Major / Stream</label>
                    <input
                      type="text"
                      name="major"
                      placeholder="e.g. Commerce, Science, Computer Science"
                      required
                      value={formData.major}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Professional Details */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-primary font-heading font-semibold border-b border-gray-100 pb-2">
                    <Briefcase className="h-5 w-5 text-secondary" />
                    <span>Professional Details</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Job Title</label>
                    <input
                      type="text"
                      name="job_title"
                      placeholder="e.g. Software Engineer, Doctor"
                      value={formData.job_title}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      name="company"
                      placeholder="e.g. Google, City Hospital"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Profile Picture (Drag & Drop or Click to Select)</label>
                    <label
                      htmlFor="avatar-upload"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer block"
                    >
                      {formData.avatar_url ? (
                        <div className="text-center space-y-2 pointer-events-none">
                          <img src={formData.avatar_url} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover mx-auto border" />
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
                        onChange={handleFileSelect}
                        className="hidden"
                        id="avatar-upload"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation controls */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                {step > 1 ? (
                  <button
                    onClick={handlePrev}
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div></div>
                )}
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark shadow-sm"
                >
                  {loading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : uploading ? (
                    <span className="animate-pulse">Uploading...</span>
                  ) : step === 3 ? (
                    <span>Submit Registration</span>
                  ) : (
                    <>
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
