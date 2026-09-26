import React, { useState } from 'react'
import { Plus, Minus, Send, HelpCircle } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const faqs = [
    { q: 'Who is eligible to join the OXAR Alumni association?', a: 'All former students who completed secondary education or spent at least two academic years at Xavier Senior Secondary School, Rohini, are eligible to join.' },
    { q: 'How does the registration approval process work?', a: 'Once you submit the multi-step join form, our administrator reviews your batch and student credentials. Upon validation, your account is approved and you receive access to the social feed and directory.' },
    { q: 'How can I update my profile details?', a: 'After logging in, navigate to "My Profile" in the top-right menu to edit your professional bio, company details, avatar, and other public visibility parameters.' },
    { q: 'Can I post news or events directly to the homepage?', a: 'Standard users can post updates in the Social Feed. News and official Events on the homepage are curated and published exclusively by the OXAR council administrators.' }
  ]

  const handleSubmitQuery = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('Please log in first to submit a query.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('queries').insert({
      user_id: session.user.id,
      subject,
      message
    })

    if (!error) {
      setSubject('')
      setMessage('')
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="font-heading font-extrabold text-3xl text-primary">Frequently Asked Questions</h1>
        <p className="font-body text-gray-500 mt-2">Find quick answers or submit a support query to the OXAR council</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQs */}
        <div className="lg:col-span-2 space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex justify-between items-center p-5 text-left font-heading font-bold text-sm text-primary hover:bg-gray-50 transition-colors"
              >
                <span>{faq.q}</span>
                {openIdx === idx ? <Minus className="h-4 w-4 text-secondary" /> : <Plus className="h-4 w-4 text-secondary" />}
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-5 font-body text-xs text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Query Form */}
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-sm h-fit">
          <h3 className="font-heading font-bold text-base text-primary mb-4 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-secondary" />
            <span>Have a Question?</span>
          </h3>
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-800 text-xs rounded-md p-3 text-center">
              Query submitted successfully! The admin council will review and respond shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmitQuery} className="space-y-4">
              <div>
                <label className="block text-xxs font-semibold text-gray-600 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 outline-none text-xs focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xxs font-semibold text-gray-600 mb-1">Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="4"
                  className="w-full border border-gray-300 rounded-md p-3 outline-none text-xs focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-semibold rounded-md text-white bg-primary hover:bg-primary-dark shadow-sm transition-all"
              >
                <Send className="h-3 w-3 mr-2" />
                <span>Submit Query</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
