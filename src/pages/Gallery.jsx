import React, { useState, useEffect } from 'react'
import { Image as ImageIcon, Archive, Clock } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('recent') // 'recent' or 'memories_archives'
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase.from('gallery')
      .select('*')
      .eq('section', activeTab)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setMedia(data)
        }
        setLoading(false)
      })
  }, [activeTab])

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="font-heading font-extrabold text-4xl text-primary tracking-tight mb-2">Alumni Gallery</h1>
        <p className="font-body text-gray-500 max-w-xl mx-auto">
          Take a trip down memory lane and look at recent events of the OXAR Alumni Association.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-10">
        <div className="bg-[#f9f9fd] p-1.5 rounded-lg border border-gray-200 inline-flex space-x-1">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center space-x-2 px-5 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
              activeTab === 'recent'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:text-primary hover:bg-white/50'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Recent Activities</span>
          </button>
          <button
            onClick={() => setActiveTab('memories_archives')}
            className={`flex items-center space-x-2 px-5 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
              activeTab === 'memories_archives'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:text-primary hover:bg-white/50'
            }`}
          >
            <Archive className="h-4 w-4" />
            <span>Memories & Archives</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : media.length === 0 ? (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-12 text-center max-w-lg mx-auto shadow-sm">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-lg text-primary mb-2">
            {activeTab === 'recent' ? 'No Recent Activities' : 'No Memories or Archives'}
          </h3>
          <p className="font-body text-sm text-gray-500">
            {activeTab === 'recent'
              ? 'No recent activities captured yet. Check back soon for photos of our latest events!'
              : 'No archives or memories uploaded yet. Explore historic albums or submit your memory files!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {media.map((item) => (
            <div
              key={item.id}
              className="group bg-white border border-[#E0E0E0] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-250"
            >
              <div className="aspect-video w-full overflow-hidden relative bg-gray-100">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h4 className="font-heading font-bold text-sm text-primary mb-1 truncate">{item.title}</h4>
                <div className="flex justify-between items-center text-xxs text-gray-400">
                  <span>{item.category}</span>
                  {item.year && <span>Year: {item.year}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
