import React from 'react'
import { Calendar, Award, BookOpen, Users } from 'lucide-react'

export default function About() {
  const timelineEvents = [
    { year: '2005', title: 'OXAR Foundation', description: 'OXAR was founded by a group of passionate alumni from early batches to maintain connections with Xavier School.' },
    { year: '2010', title: 'First Mega Reunion', description: 'Hosted the first school-wide mega reunion with over 500 attendees from across the country.' },
    { year: '2015', title: 'Mentorship Program Launch', description: 'Introduced the professional career mentoring program to guide school seniors in career planning.' },
    { year: '2020', title: 'Digital Transformation', description: 'Launched the first online member portal during the pandemic to keep the community globally connected.' },
    { year: '2025', title: 'Golden Jubilee Celebration', description: 'Celebrated 20 years of active alumni engagement with structural school facility contributions and scholarship funds.' },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Header */}
      <section className="bg-primary text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading font-extrabold text-4xl mb-4">About OXAR Alumni</h1>
          <p className="font-body text-red-100 max-w-xl mx-auto">
            Discover the history, values, mission, and the leadership structure behind the Xavier's School Alumni Association.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 max-w-5xl mx-auto px-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-8 shadow-sm">
            <h2 className="font-heading font-bold text-2xl text-primary mb-4 flex items-center">
              <Award className="h-6 w-6 mr-2 text-secondary" />
              <span>Our Mission</span>
            </h2>
            <p className="font-body text-gray-600 leading-relaxed">
              To build a vibrant, global community of Xavier's Senior Secondary School alumni by fostering mutual support, professional growth, and lifelong networking, while actively giving back to our alma mater and supporting current students.
            </p>
          </div>
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-8 shadow-sm">
            <h2 className="font-heading font-bold text-2xl text-primary mb-4 flex items-center">
              <Users className="h-6 w-6 mr-2 text-secondary" />
              <span>Our Vision</span>
            </h2>
            <p className="font-body text-gray-600 leading-relaxed">
              To be an inspiring platform of excellence where every graduate remains connected, valued, and empowered to contribute towards the legacy of Xavier's school, nurturing future leaders and making a positive impact.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-primary">OXAR History Timeline</h2>
            <p className="font-body text-gray-500 mt-2">Key milestones and history of our organization</p>
          </div>
          <div className="relative border-l-2 border-[#C9A35B]/40 ml-6 sm:ml-12 md:ml-28 pl-4 sm:pl-6">
            {timelineEvents.map((evt, idx) => (
              <div key={idx} className="mb-10 relative">
                <span className="absolute -left-[35px] sm:-left-[43px] top-0 bg-[#07131D] border-2 border-[#C9A35B] text-[#C9A35B] font-bold text-xs sm:text-sm rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 flex items-center justify-center shadow-md">
                  {evt.year}
                </span>
                <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 sm:p-6 shadow-sm max-w-2xl ml-2 sm:ml-4">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-primary mb-1">{evt.title}</h3>
                  <p className="font-body text-xs sm:text-sm text-gray-600 leading-relaxed">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
