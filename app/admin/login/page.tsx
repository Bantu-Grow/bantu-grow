'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { KeyRound, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { Logo } from '@/components/logo'
import { DecorIcon } from '@/components/decor-icon'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await loginAdmin(password)
      if (res.success) {
        router.refresh()
        router.push('/admin')
      } else {
        setError(res.error || 'Password salah')
      }
    } catch {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background glow matching brand tone */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Main card structured with Efferd borders */}
      <div className="w-full max-w-md flex flex-col gap-y-8 border border-border/80 bg-card p-8 md:p-10 shadow-xl transition-all duration-300 hover:border-primary/40 relative dark:bg-[radial-gradient(40%_40%_at_50%_0%,--theme(--color-primary/.03),transparent)]">
        {/* Corner DecorIcons from Efferd theme */}
        <DecorIcon className="size-4 text-border/80" position="top-left" />
        <DecorIcon className="size-4 text-border/80" position="top-right" />
        <DecorIcon className="size-4 text-border/80" position="bottom-left" />
        <DecorIcon className="size-4 text-border/80" position="bottom-right" />

        {/* Left and Right vertical line overlaps from Efferd theme */}
        <div className="pointer-events-none absolute -inset-y-6 -left-px w-px border-l border-border/60" />
        <div className="pointer-events-none absolute -inset-y-6 -right-px w-px border-r border-border/60" />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <Logo className="h-6" />
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Admin Panel Login
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Masukkan password administrator untuk mengelola konten BantuGrow.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive animate-in fade-in slide-in-from-top-1"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyRound className="h-4.5 w-4.5 text-muted-foreground" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin"
                className="block w-full rounded-lg border border-input bg-transparent py-2.5 pl-10 pr-3 text-sm placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Masuk...
              </>
            ) : (
              <>
                Masuk ke Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
