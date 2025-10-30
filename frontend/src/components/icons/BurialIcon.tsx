import { SVGProps } from 'react'

interface BurialIconProps extends SVGProps<SVGSVGElement> {
  className?: string
}

export function BurialIcon({ className, ...props }: BurialIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="burialGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF8C00" />
          <stop offset="1" stopColor="#C06000" />
        </linearGradient>
      </defs>

      {/* Memorial slab */}
      <rect
        x="5"
        y="15"
        width="14"
        height="4"
        rx="1"
        stroke="url(#burialGrad)"
        strokeWidth="1.6"
        fill="none"
      />

      {/* Flame (eternal fire) */}
      <path
        d="M12 6c-1.2 1.5-1.8 3.3-.9 4.7.6.9 1.9 1.3 2.9.6.8-.5 1.2-1.6.9-2.6-.2-.8-.7-1.5-1.2-2.1-.4-.5-.9-.9-1.7-1.6z"
        fill="url(#burialGrad)"
      />

      {/* Base of the flame */}
      <path
        d="M9.5 13h5"
        stroke="url(#burialGrad)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  )
}
