import { SVGProps } from 'react'

interface UnitIconProps extends SVGProps<SVGSVGElement> {
  className?: string
}

export function UnitIcon({ className, ...props }: UnitIconProps) {
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
        <linearGradient id="unitGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF8C00" />
          <stop offset="1" stopColor="#C06000" />
        </linearGradient>
      </defs>

      {/* Shield contour */}
      <path
        d="M4.5 5.5c0-1 .7-1.9 1.7-2.2l5.8-1.9a2 2 0 0 1 1.2 0l5.8 1.9a2.3 2.3 0 0 1 1.7 2.2v6.5c0 3.8-2.2 7.4-7.1 9.9a2 2 0 0 1-1.8 0c-4.9-2.5-7.3-6.1-7.3-9.9V5.5z"
        stroke="url(#unitGrad)"
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />

      {/* Inner stripes */}
      <path
        d="M7.5 8h9M7.5 11h9M7.5 14h9"
        stroke="url(#unitGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  )
}
