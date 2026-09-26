import React, { useState, useEffect } from 'react'
import { Award, Briefcase, GraduationCap, User } from 'lucide-react'
import { supabase } from '../supabaseClient'

const MOCK_ACHIEVERS = [
  { name: 'Dr. Elena Rodriguez', batch: '2008', role: 'Lead Quantum Researcher', company: 'Global Science Institute', achievements: 'Recipient of the International Quantum Frontiers Award for pioneering research in particle physics.' },
  { name: 'Amit Patel', batch: '2012', role: 'VP of Technology', company: 'EcoScale Innovations', achievements: 'Recognized in Forbes 30 Under 30 for developing scalable green-tech computing infrastructure.' },
  { name: 'Sophia Chen', batch: '2015', role: 'Creative Director', company: 'Studio Pixel', achievements: 'Directed multiple award-winning animations and interactive visual installations across major design exhibitions.' }
]

export default function DistinguishedAlumni() {
  const [achievers, setAchievers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('distinguished_alumni')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setAchievers(data)
        } else {
          setAchievers(MOCK_ACHIEVERS)
        }
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="font-heading font-extrabold text-4xl text-primary tracking-tight mb-2">Distinguished Alumni</h1>
        <p className="font-body text-gray-500 max-w-xl mx-auto">
          Honoring our graduates who have made outstanding contributions in their fields and brought pride to their alma mater.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievers.map((achiever, index) => (
            <div
              key={achiever.id || index}
              className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-center space-x-4 mb-6">
                {achiever.photo_url ? (
                  <img
                    src={achiever.photo_url}
                    alt={achiever.name}
                    className="w-16 h-16 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-heading font-bold text-lg text-primary">{achiever.name}</h3>
                  <div className="flex items-center text-xs text-secondary font-semibold mt-1">
                    <GraduationCap className="h-4 w-4 mr-1 text-gray-400" />
                    <span>Class of {achiever.batch}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {(achiever.role || achiever.company) && (
                  <div className="flex items-start text-sm text-gray-600">
                    <Briefcase className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      <span className="font-semibold text-primary">{achiever.role}</span>
                      {achiever.company && <span> at {achiever.company}</span>}
                    </div>
                  </div>
                )}
                <div className="flex items-start text-sm text-gray-600">
                  <Award className="h-4 w-4 mr-2 text-secondary mt-0.5" />
                  <p className="leading-relaxed italic">{achiever.achievements}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
