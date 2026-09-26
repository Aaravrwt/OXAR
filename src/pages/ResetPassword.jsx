import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Check } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match!')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long!')
      setLoading(false)
      return
    }

    const { error: resetError } = await supabase.auth.updateUser({
      password: password
    })

    if (resetError) {
      setError(resetError.message)
    } else {
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto py-20 px-4 sm:px-6">
      <div className="bg-white border border-[#E0E0E0] rounded-lg shadow-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <Lock className="h-10 w-10 text-secondary mx-auto" />
          <h2 className="font-heading font-extrabold text-2xl text-primary">Choose New Password</h2>
          <p className="font-body text-xs text-gray-500 font-normal">
            Please enter your new password below to complete the account recovery.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md p-3">
            Password updated successfully! Redirecting you to login page...
          </div>
        )}

        {!success && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center">
                <Lock className="h-3 w-3 mr-1 text-gray-400" />
                <span>New Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center">
                <Check className="h-3 w-3 mr-1 text-gray-400" />
                <span>Confirm New Password</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark shadow-sm transition-all"
            >
              {loading ? <span>Saving...</span> : <span>Update Password</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
