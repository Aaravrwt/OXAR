import React, { useState, useEffect } from 'react'
import { Mail, Phone, Linkedin, User } from 'lucide-react'
import { supabase } from '../supabaseClient'

const MOCK_COORDINATORS = [
  { name: 'Rohan Sharma', batch: '2024', email: 'rohan.sharma@example.com', whatsapp: '+91 98765 43210', linkedin: 'https://linkedin.com' },
  { name: 'Priya Nair', batch: '2023', email: 'priya.nair@example.com', whatsapp: '+91 87654 32109', linkedin: 'https://linkedin.com' },
  { name: 'Vikram Malhotra', batch: '2022', email: 'vikram.m@example.com', whatsapp: '+91 76543 21098', linkedin: 'https://linkedin.com' },
]

export default function Coordinators() {
  const [coordinators, setCoordinators] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('batch_coordinators')
      .select('*')
      .order('batch', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setCoordinators(data)
        } else {
          setCoordinators(MOCK_COORDINATORS)
        }
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="font-heading font-extrabold text-4xl text-primary tracking-tight mb-2">Batch Coordinators</h1>
        <p className="font-body text-gray-500 max-w-xl mx-auto">
          Connect with the designated coordinator representing each graduating batch.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {coordinators.map((coord, index) => (
            <div
              key={coord.id || index}
              className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                {coord.photo_url ? (
                  <img
                    src={coord.photo_url}
                    alt={coord.name}
                    className="w-14 h-14 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-heading font-bold text-base text-primary leading-tight">{coord.name}</h3>
                  <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded mt-1">
                    Class of {coord.batch}
                  </span>
                </div>
              </div>

              <div className="mt-auto space-y-2 border-t border-gray-100 pt-3">
                {coord.email && (
                  <a
                    href={`mailto:${coord.email}`}
                    className="flex items-center text-xs text-gray-600 hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{coord.email}</span>
                  </a>
                )}
                {coord.whatsapp && (
                  <a
                    href={`https://wa.me/${coord.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs text-gray-600 hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{coord.whatsapp}</span>
                  </a>
                )}
                {coord.linkedin && (
                  <a
                    href={coord.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs text-gray-600 hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
