import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AFFILIATE_SESSION_COOKIE, authenticateAffiliate } from '@/lib/affiliate'
import { logoutAffiliateAction } from '@/app/actions/affiliate'
import { Button } from '@/components/ui/button'

export default async function AffiliateDashboardLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(AFFILIATE_SESSION_COOKIE)?.value
  const affiliate = token ? await authenticateAffiliate(token) : null
  if (!affiliate) redirect('/affiliate/login')
  return <div className="min-h-screen bg-muted/20"><header className="border-b bg-background"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4"><Link href="/affiliate/dashboard" className="font-extrabold">BantuGrow <span className="text-primary">Affiliate</span></Link><div className="flex items-center gap-3"><span className="hidden text-sm text-muted-foreground sm:inline">{affiliate.name}</span><form action={logoutAffiliateAction}><Button type="submit" variant="outline" size="sm">Keluar</Button></form></div></div></header><main className="mx-auto max-w-6xl px-4 py-8">{children}</main></div>
}
