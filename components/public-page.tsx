import type { ComponentProps, ReactNode } from 'react'
import { CircleCheck, type LucideIcon } from 'lucide-react'
import { BrandHeroBackground } from '@/components/brand-hero-background'
import { cn } from '@/lib/utils'

export function PageContainer({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10',
        className
      )}
      {...props}
    />
  )
}

export function PublicHero({
  eyebrow,
  title,
  accent,
  description,
  children,
  beforeTitle,
  afterTitle,
  glow = true,
}: {
  eyebrow?: string
  title: ReactNode
  accent?: string
  description?: ReactNode
  children?: ReactNode
  beforeTitle?: ReactNode
  afterTitle?: ReactNode
  glow?: boolean
}) {
  return (
    <section className="relative isolate overflow-hidden bg-secondary">
      {glow && <BrandHeroBackground />}
      <PageContainer className="relative z-10 py-12 lg:py-18">
        <div className="max-w-4xl space-y-5">
          {beforeTitle}
          {eyebrow && (
            <p className="text-sm font-semibold text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h1 className="text-balance text-4xl leading-tight font-medium sm:text-5xl lg:text-6xl">
            {title}
            {accent && (
              <span className="mt-2 block text-primary">{accent}</span>
            )}
          </h1>
          {afterTitle}
          {description && (
            <div className="max-w-3xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg">
              {description}
            </div>
          )}
          {children}
        </div>
      </PageContainer>
    </section>
  )
}

export function StatusMessage({
  title,
  children,
  action,
  icon: Icon = CircleCheck,
  headingLevel = 2,
  className,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
  icon?: LucideIcon
  headingLevel?: 1 | 2 | 3
  className?: string
}) {
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3'
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-5 rounded-3xl border bg-background p-7 text-center sm:p-10',
        className
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
        <Icon className="size-7 text-primary" aria-hidden="true" />
      </div>
      <Heading className="text-balance text-3xl leading-tight font-medium">
        {title}
      </Heading>
      <div className="max-w-xl text-pretty text-base leading-8 text-muted-foreground">
        {children}
      </div>
      {action}
    </div>
  )
}
