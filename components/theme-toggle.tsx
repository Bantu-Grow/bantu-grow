'use client'

import { useTheme } from './theme-provider'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMounted } from '@/hooks/use-mounted'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  if (!mounted) {
    return <div className="size-8 animate-pulse motion-reduce:animate-none rounded-md bg-muted" />
  }

  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Ubah ke mode terang' : 'Ubah ke mode gelap'}
      className="size-8 flex items-center justify-center rounded-md transition-colors hover:bg-muted dark:hover:bg-muted/50"
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5 text-amber-500" />
      ) : (
        <Moon className="h-4.5 w-4.5 text-slate-700" />
      )}
    </Button>
  )
}
