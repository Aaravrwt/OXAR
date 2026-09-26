import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Key } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleResetRequest = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (resetError) {
      setError(resetError.message)
    } else {
      setMessage('Password reset link has been sent to your email address!')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto py-20 px-4 sm:px-6">
      <div className="bg-white border border-[#E0E0E0] rounded-lg shadow-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <Key className="h-10 w-10 text-secondary mx-auto" />
          <h2 className="font-heading font-extrabold text-2xl text-primary">Reset Password</h2>
          <p className="font-body text-xs text-gray-500">
            Enter your email address and we will send you a recovery link to choose a new password.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md p-3">
            {message}
          </div>
        )}

        <form onSubmit={handleResetRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center">
              <Mail className="h-3 w-3 mr-1 text-gray-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark shadow-sm transition-all"
          >
            {loading ? <span>Sending...</span> : <span>Send Recovery Link</span>}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center text-xs text-secondary hover:underline">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
