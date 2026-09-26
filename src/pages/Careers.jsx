import React, { useState, useEffect } from 'react'
import { Briefcase, Send, Users, FileText, Plus, User, Mail, Link as LinkIcon, Building2 } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Careers() {
  const [activeTab, setActiveTab] = useState('jobs') // 'jobs', 'post', 'reviews'
  const [jobs, setJobs] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  
  // Job Form State
  const [jobForm, setJobForm] = useState({
    title: '', company: '', location: '', type: 'Full-time',
    category: 'Job Board', description: '', requirements: '',
    referral_available: false, contact_email: '', apply_url: ''
  })
  // Resume Review State
  const [reviewForm, setReviewForm] = useState({ notes: '', resume_url: '' })
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  useEffect(() => {
    fetchJobs()
    if (user) {
      fetchReviews()
    }
  }, [user])

  const fetchJobs = async () => {
    setLoading(true)
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  const fetchReviews = async () => {
    const { data } = await supabase.from('resume_reviews').select('*').order('created_at', { ascending: false })
    setReviews(data || [])
  }

  const handlePostJob = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Please login to post jobs!')
      return
    }
    const { error } = await supabase.from('jobs').insert({
      ...jobForm,
      posted_by: user.id
    })
    if (!error) {
      alert('Job posted successfully!')
      setJobForm({
        title: '', company: '', location: '', type: 'Full-time',
        category: 'Job Board', description: '', requirements: '',
        referral_available: false, contact_email: '', apply_url: ''
      })
      fetchJobs()
      setActiveTab('jobs')
    } else {
      alert(error.message)
    }
  }

  const handleRequestReview = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Please login to request a resume review!')
      return
    }
    
    // Fetch profile to get name & email
    const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).single()

    const { error } = await supabase.from('resume_reviews').insert({
      applicant_name: profile?.full_name || 'Alumni Member',
      email: profile?.email || user.email,
      resume_url: reviewForm.resume_url,
      notes: reviewForm.notes,
      user_id: user.id
    })

    if (!error) {
      alert('Resume review request submitted successfully!')
      setReviewForm({ notes: '', resume_url: '' })
      fetchReviews()
    } else {
      alert(error.message)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="font-heading font-extrabold text-4xl text-primary tracking-tight mb-2">Careers & Jobs Portal</h1>
        <p className="font-body text-gray-500 max-w-xl mx-auto">
          Explore job boards, internships, and referral opportunities shared by alumni members.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-8 space-x-6">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'jobs' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'
          }`}
        >
          Explore Openings
        </button>
        <button
          onClick={() => setActiveTab('post')}
          className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'post' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'
          }`}
        >
          Post a Job / Internship
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'
          }`}
        >
          Resume Reviews
        </button>
      </div>

      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm max-w-md mx-auto">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-lg text-primary mb-2">No Jobs Posted Yet</h3>
              <p className="font-body text-sm text-gray-500">
                No jobs or internships posted yet. Be the first to share an opportunity!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-secondary tracking-wider block mb-1">
                          {job.category}
                        </span>
                        <h3 className="font-heading font-bold text-lg text-primary leading-snug">{job.title}</h3>
                        <p className="text-sm font-semibold text-gray-600 flex items-center mt-1">
                          <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                          {job.company} {job.location && `| ${job.location}`}
                        </p>
                      </div>
                      <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded">
                        {job.type}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-3 my-4 leading-relaxed">
                      {job.description}
                    </p>

                    {job.requirements && (
                      <div className="mb-4">
                        <span className="text-xxs font-bold uppercase tracking-wider text-gray-400 block mb-1">Requirements</span>
                        <p className="text-xs text-gray-600 truncate">{job.requirements}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
                    {job.referral_available && (
                      <span className="bg-green-50 text-green-700 text-xxs font-bold px-2 py-0.5 rounded-full">
                        Referral Available
                      </span>
                    )}
                    <div className="flex space-x-3 ml-auto">
                      {job.apply_url && (
                        <a
                          href={job.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-primary hover:text-primary-dark"
                        >
                          Apply Link
                        </a>
                      )}
                      <a
                        href={`mailto:${job.contact_email}`}
                        className="text-xs font-semibold text-secondary hover:text-secondary-dark flex items-center"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        <span>Email Contact</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'post' && (
        <form onSubmit={handlePostJob} className="bg-white border border-[#E0E0E0] rounded-lg p-8 shadow-sm max-w-2xl mx-auto space-y-4">
          <h2 className="font-heading font-bold text-xl text-primary mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-secondary" />
            <span>Post a Job or Internship Opportunity</span>
          </h2>
          {!user ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm font-semibold">
              Please login first to publish career opportunities on the board.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    required
                    value={jobForm.company}
                    onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote, New Delhi"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Job Type</label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm bg-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category Section</label>
                  <select
                    value={jobForm.category}
                    onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm bg-white"
                  >
                    <option value="Job Board">Job Board</option>
                    <option value="Internship Opportunities">Internship Opportunities</option>
                    <option value="Alumni Hiring Alumni">Alumni Hiring Alumni</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={jobForm.contact_email}
                    onChange={(e) => setJobForm({ ...jobForm, contact_email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Apply URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={jobForm.apply_url}
                    onChange={(e) => setJobForm({ ...jobForm, apply_url: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <input
                    type="checkbox"
                    id="referral"
                    checked={jobForm.referral_available}
                    onChange={(e) => setJobForm({ ...jobForm, referral_available: e.target.checked })}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="referral" className="ml-2 block text-xs font-semibold text-gray-600">
                    I am willing to refer applicants internally
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Requirements (Short Summary)</label>
                <input
                  type="text"
                  placeholder="e.g. 2+ years React exp, Python backend basics"
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Description</label>
                <textarea
                  required
                  rows="4"
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-3 outline-none text-sm"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-semibold"
              >
                <Send className="h-4 w-4 mr-2" />
                <span>Publish Job</span>
              </button>
            </>
          )}
        </form>
      )}

      {activeTab === 'reviews' && (
        <div className="max-w-2xl mx-auto space-y-8">
          <form onSubmit={handleRequestReview} className="bg-white border border-[#E0E0E0] rounded-lg p-8 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-xl text-primary mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-secondary" />
              <span>Request a Resume Review</span>
            </h2>
            {!user ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm font-semibold">
                Please login to request resume reviews.
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Resume Link (PDF Link, Drive Link etc.)</label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/..."
                    value={reviewForm.resume_url}
                    onChange={(e) => setReviewForm({ ...reviewForm, resume_url: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Special Notes / Desired Field</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Seeking entry-level product management roles, please review formatting..."
                    value={reviewForm.notes}
                    onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-3 outline-none text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-semibold"
                >
                  <Send className="h-4 w-4 mr-2" />
                  <span>Submit Request</span>
                </button>
              </>
            )}
          </form>

          {user && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-heading font-bold text-lg text-primary mb-4">Your Resume Review Requests</h3>
              {reviews.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-500">
                    No resume review requests submitted yet. Request reviews from expert senior alumni!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="border border-gray-100 p-4 rounded-md flex justify-between items-center bg-white shadow-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            r.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
                          }`}>
                            {r.status}
                          </span>
                          <span className="text-xs text-gray-400">Submitted: {new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-600 mt-2 truncate max-w-sm">{r.notes || 'No notes added'}</p>
                      </div>
                      <a
                        href={r.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-primary hover:text-primary-dark flex items-center"
                      >
                        <LinkIcon className="h-3.5 w-3.5 mr-1" />
                        <span>Resume</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
