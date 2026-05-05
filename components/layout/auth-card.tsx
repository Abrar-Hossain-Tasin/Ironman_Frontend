import Link from 'next/link'
import { AuthForm } from '@/components/auth/auth-form'

type AuthCardProps = {
  mode: 'login' | 'register'
}

export function AuthCard({ mode }: AuthCardProps) {
  const isLogin = mode === 'login'

  return (
    <main className="min-h-screen bg-ironman-navy-50">
      <div className="container-page flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md rounded-lg border border-ironman-navy-100 bg-white p-6 shadow-soft">
          <Link href="/" className="inline-flex items-center gap-3 font-bold text-ironman-navy">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ironman-navy text-white">IM</span>
            IRONMAN
          </Link>
          <h1 className="mt-8 text-3xl font-bold text-ironman-navy">{isLogin ? 'Login' : 'Create account'}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Access customer, admin, delivery, and worker portals.' : 'Register as a customer and add your first address.'}
          </p>
          <AuthForm mode={mode} />
          <p className="mt-5 text-center text-sm text-gray-600">
            {isLogin ? 'New customer?' : 'Already registered?'}{' '}
            <Link href={isLogin ? '/register' : '/login'} className="font-semibold text-ironman-red">
              {isLogin ? 'Create an account' : 'Login'}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
