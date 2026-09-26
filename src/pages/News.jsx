import React, { useState, useEffect } from 'react'
import { Search, FileText, Download, Calendar } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function News() {
  const [news, setNews] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('news').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setNews(data)
        } else {
          setNews([
            { id: '1', title: 'Golden Jubilee Reunion: A Night to Remember', category: 'Reunion', excerpt: 'Alumni across five decades gathered last Saturday to celebrate our golden jubilee anniversary.', content: 'Full reunion write-up...', created_at: '2026-05-15', thumbnail_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600', pdf_url: '' },
            { id: '2', title: 'New Mentorship Program Launched for Seniors', category: 'Campus', excerpt: 'OXAR is proud to introduce a new platform linking current secondary seniors with industry professionals.', content: 'Full mentorship launch info...', created_at: '2026-05-12', thumbnail_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600', pdf_url: '' },
            { id: '3', title: 'OXAR Spring Newsletter 2026 (PDF)', category: 'Newsletter', excerpt: 'Download the complete Spring edition newsletter compiling student records, class notes, and treasury reports.', content: 'Find compiled reports.', created_at: '2026-04-30', thumbnail_url: '', pdf_url: '#' }
          ])
        }
        setLoading(false)
      })
  }, [])

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.excerpt.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['All', 'Reunion', 'Campus', 'Achievement', 'Newsletter']

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="font-heading font-extrabold text-3xl text-primary">News & Newsletters</h1>
        <p className="font-body text-gray-500 mt-2">Latest alumni network publications, achievements, and newsletters</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-lg border border-[#E0E0E0] shadow-sm flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none transition-all duration-200 bg-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredNews.map(item => (
            <div key={item.id} className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-250 flex flex-col justify-between">
              <div>
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-[#f9f9fd] flex flex-col items-center justify-center border-b border-[#E0E0E0]">
                    <FileText className="h-12 w-12 text-secondary mb-2" />
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Official Publication</span>
                  </div>
                )}
                <div className="p-6">
                  <span className="text-xxs font-bold text-secondary uppercase tracking-wider">{item.category}</span>
                  <h3 className="font-heading font-bold text-base text-primary mt-2 mb-3 leading-tight">{item.title}</h3>
                  <p className="font-body text-xs text-gray-500 line-clamp-3">{item.excerpt}</p>
                </div>
              </div>
              <div className="p-6 pt-0 mt-auto border-t border-gray-50 flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {item.created_at}
                </span>
                {item.pdf_url ? (
                  <a
                    href={item.pdf_url}
                    download
                    className="inline-flex items-center text-primary hover:text-primary-dark font-semibold"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    <span>Download PDF</span>
                  </a>
                ) : (
                  <button className="text-primary hover:text-primary-dark font-semibold">Read Online</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
