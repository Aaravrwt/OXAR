import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Grid, Video } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Events() {
  const [activeTab, setActiveTab] = useState('events')
  const [events, setEvents] = useState([])
  const [gallery, setGallery] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch events
    supabase.from('events').select('*').order('event_date', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setEvents(data)
        } else {
          setEvents([
            { id: '1', title: 'OXAR annual Alumni Meet 2026', description: 'Our flagship annual gathering of all batches. High tea, sports match, and networking gala.', event_date: '2026-12-18T16:00:00Z', location: 'Main School Grounds, Rohini', image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600' },
            { id: '2', title: 'Career Guidance & Counseling Seminar', description: 'Alumni working in tech, healthcare, and finance guide senior class secondary students.', event_date: '2026-08-22T10:00:00Z', location: 'Auditorium, Xavier School', image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600' }
          ])
        }
      })

    // Fetch gallery
    supabase.from('gallery').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setGallery(data)
        } else {
          setGallery([
            { id: '1', title: 'Batch of 2005 20-Year Reunion', image_url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400', category: 'Reunion', year: '2025' },
            { id: '2', title: 'Annual Sports Meet 2024 Alumni Team', image_url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400', category: 'Sports', year: '2024' },
            { id: '3', title: 'Classroom Block Inauguration', image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400', category: 'Campus', year: '2023' }
          ])
        }
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Tabs */}
      <div className="flex justify-center border-b border-[#E0E0E0] mb-10">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-heading font-semibold text-lg transition-all duration-200 ${
            activeTab === 'events' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span>Upcoming Events</span>
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-heading font-semibold text-lg transition-all duration-200 ${
            activeTab === 'gallery' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Grid className="h-5 w-5" />
          <span>Alumni Gallery</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
        </div>
      ) : activeTab === 'events' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map(event => (
            <div key={event.id} className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-250 flex flex-col md:flex-row">
              <img src={event.image_url} alt={event.title} className="w-full md:w-48 h-48 object-cover" />
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-primary mb-2">{event.title}</h3>
                  <p className="font-body text-sm text-gray-500 mb-4 line-clamp-3">{event.description}</p>
                </div>
                <div className="space-y-2 border-t border-gray-100 pt-3 text-xs text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-secondary" />
                    <span>{new Date(event.event_date).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-secondary" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gallery.map(item => (
            <div key={item.id} className="relative group overflow-hidden rounded-lg border border-[#E0E0E0] shadow-sm bg-white">
              <img src={item.image_url} alt={item.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-250" />
              <div className="p-4">
                <span className="text-xxs font-semibold text-secondary uppercase">{item.category} ({item.year})</span>
                <h4 className="font-heading font-bold text-sm text-primary mt-1">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
