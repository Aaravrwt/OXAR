import React, { useState, useEffect } from 'react'
import { Send, ThumbsUp, MessageSquare, Trash2, Image, User, Upload } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function SocialFeed() {
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleImageUpload = async (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed!')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB!')
      return
    }

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(fileName, file)

    if (uploadError) {
      alert(uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(fileName)

    setImageUrl(publicUrl)
    setUploading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        setProfile(data)
      })
    }
  }, [user])

  const fetchPosts = () => {
    supabase.from('posts')
      .select('*, profiles(full_name, avatar_url, batch)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setPosts(data)
        }
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newPost.trim() || !user) return

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content: newPost,
      image_url: imageUrl || null
    })

    if (!error) {
      setNewPost('')
      setImageUrl('')
      fetchPosts()
    }
  }

  const handleDeletePost = async (postId) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId).eq('user_id', user.id)
    if (!error) {
      fetchPosts()
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-8">
        <h1 className="font-heading font-bold text-3xl text-primary">Alumni Social Feed</h1>
        <p className="font-body text-gray-500 mt-1">Share posts, ask advice, and interact with fellow graduates</p>
      </div>

      {user && profile?.approved ? (
        <form onSubmit={handleCreatePost} className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-start space-x-4">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <div className="flex-1 space-y-4">
              <textarea
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows="3"
                className="w-full border border-gray-300 rounded-md p-3 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Post Image (Drag & Drop or Click to Select)</label>
                <label
                  htmlFor="post-image-upload"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer block"
                >
                  {uploading ? (
                    <div className="text-center space-y-2 pointer-events-none">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
                      <p className="text-xxs text-gray-500 font-semibold">Uploading image...</p>
                    </div>
                  ) : imageUrl ? (
                    <div className="text-center space-y-2 pointer-events-none">
                      <img src={imageUrl} alt="Post Preview" className="w-full max-h-48 object-cover rounded-md border mx-auto" />
                      <p className="text-xxs text-green-600 font-semibold">Upload complete! Click to change.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center pointer-events-none">
                      <Upload className="mx-auto h-10 w-10 text-gray-400" />
                      <p className="text-xs text-gray-500">Drag & drop your picture here, or click to upload</p>
                      <p className="text-xxs text-gray-400">PNG, JPG, JPEG under 2MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="post-image-upload"
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark shadow-sm transition-all"
            >
              <Send className="h-4 w-4 mr-2" />
              <span>Post</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-700 mb-8">
          <p className="text-sm font-medium">
            Please log in and wait for admin approval to share posts in the social feed.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  {post.profiles?.avatar_url ? (
                    <img src={post.profiles.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-heading font-bold text-sm text-primary">{post.profiles?.full_name || 'Alumni Member'}</h3>
                    <p className="text-xxs text-secondary font-semibold">Batch {post.profiles?.batch || 'N/A'}</p>
                  </div>
                </div>
                {user && user.id === post.user_id && (
                  <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="font-body text-sm text-gray-600 mb-4 whitespace-pre-wrap">{post.content}</p>
              {post.image_url && (
                <img src={post.image_url} alt="" className="w-full max-h-96 object-cover rounded-lg mb-4 border border-gray-100" />
              )}
              <div className="flex items-center text-xs text-gray-400 space-x-6 border-t border-gray-100 pt-3">
                <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                  <ThumbsUp className="h-4 w-4" />
                  <span>Like</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  <span>Comment</span>
                </button>
                <span className="ml-auto">{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
