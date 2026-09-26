import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Key, Mail } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (loginError) {
      setError(loginError.message)
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto py-16 sm:py-20 px-4 sm:px-6">
      <div className="bg-white border border-[#E0E0E0] rounded-xl shadow-md p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-heading font-extrabold text-2xl text-primary">Login to Your Account</h2>
          <p className="font-body text-xs text-gray-500">Access the social feed, directory, and events RSVP</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
              <Mail className="h-3 w-3 mr-1 text-gray-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 bg-white text-[#07131D] placeholder:text-gray-400 font-medium rounded-lg px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
              <span className="flex items-center">
                <Key className="h-3 w-3 mr-1 text-gray-400" />
                <span>Password</span>
              </span>
              <Link to="/forgot-password" className="text-xxs text-secondary hover:underline">Forgot password?</Link>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 bg-white text-[#07131D] placeholder:text-gray-400 font-medium rounded-lg px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary-dark shadow-sm transition-all"
          >
            {loading ? <span>Connecting...</span> : <span>Login</span>}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/join" className="text-secondary font-semibold hover:underline">
              Join the Network
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
