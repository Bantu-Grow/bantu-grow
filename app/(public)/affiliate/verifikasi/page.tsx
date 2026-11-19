import { PageContainer, StatusMessage } from '@/components/public-page'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CircleCheck, CircleAlert } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { verifyAffiliateEmail } from '@/lib/affiliate'

export const metadata: Metadata = { title: 'Verifikasi Affiliate — BantuGrow' }
export default async function VerifyAffiliatePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const token = (await searchParams).token
  let verified = false
  if (token) {
    try {
      verified = await verifyAffiliateEmail(token)
    } catch {
      verified = false
    }
  }
  return (
    <div className="bg-secondary">
      <PageContainer className="py-12 lg:py-24">
        <StatusMessage
          className="mx-auto max-w-3xl"
          headingLevel={1}
          icon={verified ? CircleCheck : CircleAlert}
          title={
            verified
              ? 'Email berhasil diverifikasi'
              : 'Tautan verifikasi tidak valid'
          }
          action={
            <Link
              href={verified ? '/affiliate/login' : '/kontak'}
              className={cn(
                buttonVariants({ variant: 'brand', size: 'pill-sm' })
              )}
            >
              {verified ? 'Ke halaman login' : 'Hubungi kami'}
            </Link>
          }
        >
          {verified
            ? 'Email Anda sudah terverifikasi. Akun dapat digunakan setelah disetujui tim BantuGrow.'
            : 'Tautan mungkin sudah digunakan atau kedaluwarsa. Hubungi tim BantuGrow bila Anda memerlukan bantuan.'}
        </StatusMessage>
      </PageContainer>
    </div>
  )
}
