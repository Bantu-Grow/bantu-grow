import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Quote } from 'lucide-react'
import { testimonials } from '@/content/testimonials'

export function TestimonialsSection() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {testimonials.map(({ quote, name, role, company }) => (
        <figure key={name} className="flex flex-col gap-6 rounded-2xl border bg-muted p-7">
          <Quote aria-hidden="true" className="size-6 text-muted-foreground" />
          <blockquote className="flex-1 text-base leading-8 text-foreground">{quote}</blockquote>
          <figcaption className="mt-auto flex items-center gap-3 pt-4">
            <Avatar className="size-11">
              <AvatarFallback className="bg-primary font-semibold text-foreground">{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <cite className="text-sm font-semibold not-italic">{name}</cite>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{role}, {company}</p>
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
