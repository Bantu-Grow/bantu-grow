import { Layers, Coins, Headset, Target } from 'lucide-react'
import { copy } from '@/content/copy'

const featureIcons = [Layers, Coins, Headset, Target]

export function FeatureSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10" aria-labelledby="advantages-heading">
      <div className="grid gap-10 rounded-3xl bg-foreground p-7 text-background sm:p-10 lg:grid-cols-3 lg:gap-16 lg:p-14">
        <div className="flex flex-col gap-6">
          <h2 id="advantages-heading" className="text-balance text-3xl leading-tight font-medium lg:text-4xl">{copy.valuePropHeadline}</h2>
          <p className="text-pretty text-base leading-7 text-border">{copy.valuePropDescription}</p>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 lg:col-span-2">
          {copy.valuePropItems.map((feature, index) => {
            const Icon = featureIcons[index]
            return (
              <div key={feature.title} className="flex flex-col gap-4">
                <Icon className="size-6 text-primary" aria-hidden="true" />
                <h3 className="font-sans text-lg font-semibold text-balance">{feature.title}</h3>
                <p className="text-pretty text-base leading-7 text-border">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
