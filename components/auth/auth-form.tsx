'use client'

import { FormEvent, useState, useId } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Phone, MapPin } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { roleHome, useAuthStore } from '@/lib/auth-store'
import type { AuthResponse } from '@/types'

// ─── Reusable Animated Input ───────────────────────────────────────────────
function FloatingInput({ name, label, type = 'text', icon: Icon, required, minLength, delay = 0, shake = false }: any) {
  const [focused, setFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const id = useId()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : {}} className="relative">
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${focused ? 'scale-110 text-ironman-red' : 'text-gray-300'}`}>
          <Icon className="h-4 w-4" />
        </div>
        <input
          id={id} name={name} type={type} required={required} minLength={minLength} placeholder=" "
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); setHasValue(e.target.value.length > 0) }}
          onChange={(e) => setHasValue(e.target.value.length > 0)}
          className={`peer w-full rounded-2xl border bg-white pl-11 pr-4 pt-6 pb-2 font-body text-sm text-ironman-navy outline-none transition-all duration-300
            ${focused ? 'border-ironman-red shadow-[0_0_15px_rgba(216,27,42,0.1)]' : 'border-ironman-navy-100 hover:border-ironman-navy-200'}`}
        />
        <label htmlFor={id} className={`pointer-events-none absolute left-11 font-body transition-all duration-300
            ${focused || hasValue ? 'top-2 text-[10px] font-bold uppercase tracking-wider text-ironman-red' : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'}`}>
          {label}
        </label>
      </motion.div>
    </motion.div>
  )
}

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isLogin = mode === 'login'

  // PRESERVED LOGIC
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(event.currentTarget)
    const payload = isLogin
      ? { email: String(form.get('email') ?? ''), password: String(form.get('password') ?? '') }
      : { fullName: String(form.get('fullName') ?? ''), email: String(form.get('email') ?? ''), phone: String(form.get('phone') ?? ''), password: String(form.get('password') ?? '') }

    try {
      const auth = await apiFetch<AuthResponse>(isLogin ? '/auth/login' : '/auth/register', { method: 'POST', body: payload })
      setAuth(auth)
      const address = String(form.get('address') ?? '').trim()
      if (mode === 'register' && address) {
        await apiFetch('/users/me/addresses', { method: 'POST', token: auth.accessToken, body: { label: 'Home', addressLine1: address, area: 'Dhaka', city: 'Dhaka', defaultAddress: true } })
      }
      router.push(roleHome(auth.user.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={submit}>
      <AnimatePresence mode="popLayout">
        {!isLogin && (
          <div className="space-y-4">
            <FloatingInput name="fullName" label="Full Name" icon={User} required delay={0.1} shake={!!error} />
            <FloatingInput name="phone" label="Phone Number" icon={Phone} required delay={0.15} shake={!!error} />
          </div>
        )}
      </AnimatePresence>

      <FloatingInput name="email" label="Email Address" type="email" icon={Mail} required delay={0.2} shake={!!error} />
      <FloatingInput name="password" label="Password" type="password" icon={Lock} required minLength={8} delay={0.25} shake={!!error} />

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-ironman-red px-2">{error}</motion.p>
      )}

      <motion.button
        type="submit" disabled={loading} whileTap={{ scale: 0.96 }}
        className="relative h-14 w-full overflow-hidden rounded-2xl bg-ironman-red font-body font-bold text-white shadow-glow transition-all hover:shadow-luxury disabled:opacity-70"
      >
        <span className="relative z-10">{loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}</span>
        <div className="absolute inset-0 z-0 animate-shimmer-sweep bg-shimmer" style={{ backgroundSize: '200% 100%' }} />
      </motion.button>

      <div className="relative flex items-center py-2">
        <div className="h-px flex-1 bg-gray-100" /><span className="px-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Or</span><div className="h-px flex-1 bg-gray-100" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {['Google', 'Facebook'].map((p, i) => (
          <motion.button key={p} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + (i * 0.1) }} type="button" 
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white font-body text-xs font-bold text-ironman-navy hover:bg-gray-50 transition-colors">
            {p}
          </motion.button>
        ))}
      </div>
    </form>
  )
}