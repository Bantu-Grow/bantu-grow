import { checkAdminSession, logoutAdmin } from '@/app/actions/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { AdminNav } from './AdminNav'
import { LogOut, ArrowLeft } from 'lucide-react'
import React from 'react'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthed = await checkAdminSession()
  if (!isAuthed) {
    redirect('/admin/login')
  }

  async function handleLogout() {
    'use server'
    await logoutAdmin()
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border/80 flex flex-col justify-between shrink-0">
        <div>
          {/* Header Sidebar */}
          <div className="h-16 px-6 border-b border-border/80 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-5" />
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wide">
                Admin
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <AdminNav />
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-border/80 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/50 transition-colors w-full"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Website
          </Link>
          <form action={handleLogout}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors w-full text-left"
            >
              <LogOut className="h-4.5 w-4.5" />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        <div className="h-16 px-6 md:px-8 border-b border-border/80 flex items-center justify-between bg-card">
          <h1 className="text-lg font-bold text-foreground">Management System</h1>
          <div className="text-xs text-muted-foreground font-medium">
            Status: <span className="text-emerald-500 font-semibold">Aktif</span>
          </div>
        </div>
        <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
