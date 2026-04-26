import { Loader2 } from 'lucide-react'

interface LoaderProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Loader({ message = 'Loading...', size = 'md' }: LoaderProps) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 animate-fade-in">
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-2 border-accent/20 border-t-accent animate-spin`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className={`${sizes[size === 'lg' ? 'md' : 'sm']} text-accent opacity-50`} />
        </div>
      </div>
      <p className="text-text-muted text-sm animate-pulse-glow">{message}</p>
    </div>
  )
}
