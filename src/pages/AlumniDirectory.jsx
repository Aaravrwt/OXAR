import React, { useState, useEffect } from 'react'
import { Search, Filter, Mail, Linkedin, User } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState([])
  const [search, setSearch] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('profiles')
      .select('*')
      .eq('approved', true)
      .then(({ data, error }) => {
        if (!error && data) {
          setAlumni(data)
        } else {
          // Fallback mocks
          setAlumni([
            { id: '1', full_name: 'Dr. Elena Rodriguez', batch: '2008', degree: 'Ph.D.', major: 'Quantum Physics', job_title: 'Lead Quantum Researcher', company: 'Global Science Institute', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
            { id: '2', full_name: 'Amit Patel', batch: '2012', degree: 'B.Tech', major: 'Computer Science', job_title: 'VP of Technology', company: 'EcoScale Innovations', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
            { id: '3', full_name: 'Sophia Chen', batch: '2015', degree: 'B.Des', major: 'Communication Design', job_title: 'Creative Director', company: 'Studio Pixel', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
            { id: '4', full_name: 'Rohan Sharma', batch: '2010', degree: 'MBA', major: 'Finance', job_title: 'Investment Banker', company: 'Apex Assets', avatar_url: '' }
          ])
        }
        setLoading(false)
      })
  }, [])

  const filteredAlumni = alumni.filter(alum => {
    const matchesSearch = alum.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                          alum.major?.toLowerCase().includes(search.toLowerCase()) ||
                          alum.company?.toLowerCase().includes(search.toLowerCase())
    const matchesBatch = selectedBatch === 'All' || alum.batch === selectedBatch
    return matchesSearch && matchesBatch
  })

  // Extract unique batches for filtering
  const batches = ['All', ...new Set(alumni.map(a => a.batch).filter(Boolean))].sort()

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="font-heading font-extrabold text-3xl text-primary">Alumni Directory</h1>
        <p className="font-body text-gray-500 mt-2">Connect with verified graduates and search classmates</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-lg border border-[#E0E0E0] shadow-sm flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, major, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
          />
        </div>
        <div className="w-full md:w-48 relative">
          <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none transition-all duration-200 bg-white"
          >
            {batches.map(batch => (
              <option key={batch} value={batch}>Batch {batch}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredAlumni.map(alum => (
            <div key={alum.id} className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-250 flex flex-col">
              <div className="flex flex-col items-center p-6 text-center flex-grow">
                {alum.avatar_url ? (
                  <img src={alum.avatar_url} alt={alum.full_name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 mb-4" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <h3 className="font-heading font-bold text-base text-primary mb-1">{alum.full_name}</h3>
                <p className="font-body text-xs font-semibold text-secondary mb-3">Batch of {alum.batch}</p>
                <p className="font-body text-xs text-gray-500 font-medium mb-1">{alum.job_title || 'Alumni Member'}</p>
                <p className="font-body text-xxs text-gray-400">{alum.company || 'Not Specified'}</p>
                {alum.major && (
                  <span className="inline-block bg-[#f9f9fd] border border-gray-100 text-xxs text-gray-500 rounded-full px-3 py-1 mt-3">
                    {alum.major}
                  </span>
                )}
              </div>
              <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex justify-center space-x-4">
                <a href={`mailto:${alum.email || ''}`} className="text-gray-400 hover:text-primary transition-all">
                  <Mail className="h-4 w-4" />
                </a>
                <a href={alum.linkedin_url || '#'} className="text-gray-400 hover:text-primary transition-all">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
