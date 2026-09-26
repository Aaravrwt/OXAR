import React, { useState, useEffect } from 'react'
import { Award, Calendar, DollarSign, Info } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Scholarships() {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('scholarships')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setScholarships(data)
        }
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="font-heading font-extrabold text-4xl text-primary tracking-tight mb-2">Scholarships</h1>
        <p className="font-body text-gray-500 max-w-xl mx-auto">
          Financial support, awards, and opportunities sponsored by the OXAR Alumni Association.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : scholarships.length === 0 ? (
        <div className="bg-[#f9f9fd] border border-[#E0E0E0] rounded-lg p-8 text-center max-w-lg mx-auto">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-lg text-primary mb-2">No Scholarships Available</h3>
          <p className="font-body text-sm text-gray-500">
            No scholarships available at this moment. Please check back later or contact the council for upcoming sponsorships.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {scholarships.map((scholarship) => (
            <div
              key={scholarship.id}
              className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-heading font-bold text-xl text-primary">{scholarship.title}</h3>
                  {scholarship.amount && (
                    <div className="flex items-center text-sm font-semibold text-secondary mt-1">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{scholarship.amount}</span>
                    </div>
                  )}
                </div>
                {scholarship.deadline && (
                  <span className="bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    Deadline: {scholarship.deadline}
                  </span>
                )}
              </div>

              <p className="font-body text-sm text-gray-600 mb-4 leading-relaxed whitespace-pre-wrap">
                {scholarship.description}
              </p>

              {scholarship.eligibility && (
                <div className="bg-gray-50 rounded-md p-4 border border-gray-100 mb-4 text-xs text-gray-700">
                  <div className="flex items-center font-semibold text-primary mb-1">
                    <Info className="h-4 w-4 mr-1 text-secondary" />
                    <span>Eligibility Criteria:</span>
                  </div>
                  <p>{scholarship.eligibility}</p>
                </div>
              )}

              {scholarship.apply_url && (
                <a
                  href={scholarship.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors"
                >
                  Apply Now
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
