'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage({ searchParams }: { searchParams: { redirect?: string } }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostraPwd, setMostraPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function accedi(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message.includes('Invalid') ? 'Email o password errati' : error.message)
    } else {
      router.push(searchParams.redirect ?? '/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  async function loginGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-ultra-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1 mb-6">
            <span className="text-2xl font-bold text-primary-600">Locali</span>
            <span className="text-2xl font-bold text-accent-500">Commerciali</span>
            <span className="text-2xl text-mid">.it</span>
          </Link>
          <h1 className="font-display text-3xl font-semibold text-dark">Bentornato</h1>
          <p className="text-mid mt-2">Accedi al tuo account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={accedi} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="tua@email.it" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Password</label>
              <div className="relative">
                <input type={mostraPwd ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setMostraPwd(!mostraPwd)}
                  className="absolute right-3 top-3 text-mid hover:text-dark">
                  {mostraPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link href="/password-dimenticata" className="text-xs text-primary-600 hover:underline">
                  Password dimenticata?
                </Link>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Accedi'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 border-t border-gray-100" />
            <span className="text-xs text-mid">oppure</span>
            <div className="flex-1 border-t border-gray-100" />
          </div>

          <button onClick={loginGoogle}
            className="w-full border border-gray-200 rounded-xl py-3 text-sm font-semibold text-dark hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <span className="text-[#4285F4] font-bold">G</span>
            Continua con Google
          </button>
        </div>

        <p className="text-center text-sm text-mid mt-6">
          Non hai un account?{' '}
          <Link href="/registrati" className="text-primary-600 font-semibold hover:underline">Registrati gratis</Link>
        </p>
      </div>
    </div>
  )
}
