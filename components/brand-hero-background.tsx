import { LogoIcon } from '@/components/logo'

export function BrandHeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -bottom-16 -left-40 size-120 rounded-full bg-primary opacity-10 blur-[120px] lg:-bottom-25 lg:-left-45 lg:size-180 lg:opacity-15" />
      <div className="absolute -top-24 -right-24 size-100 rounded-full bg-primary opacity-10 blur-[100px] lg:-top-40 lg:-right-25 lg:size-160" />
      <LogoIcon imageSizes="(min-width: 1024px) 600px, 320px" className="absolute -top-12 -right-24 size-80 -rotate-12 opacity-6 lg:-top-23 lg:-right-35 lg:size-150" />
    </div>
  )
}
