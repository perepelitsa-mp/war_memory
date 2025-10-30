import { SVGProps } from 'react'

interface RankIconProps extends SVGProps<SVGSVGElement> {
  className?: string
}

export function RankIcon({ className, ...props }: RankIconProps) {
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
        <linearGradient id="rankGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF8C00" />
          <stop offset="1" stopColor="#C06000" />
        </linearGradient>
      </defs>

      {/* Shoulder board silhouette */}
      <path
        d="M8 3a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V3z"
        stroke="url(#rankGrad)"
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />

      {/* Decorative lines (rank stripes) */}
      <path
        d="M9 10h6M9 13h6M9 16h6"
        stroke="url(#rankGrad)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Star symbol */}
      <path
        d="M12 6.8l.9 1.8 2 .3-1.45 1.4.35 2.05L12 11.4l-1.8 1.25.35-2.05-1.45-1.4 2-.3.9-1.8z"
        fill="url(#rankGrad)"
        stroke="none"
      />

      {/* Button hole */}
      <circle cx="12" cy="4.3" r="1.1" stroke="url(#rankGrad)" strokeWidth="1.4" fill="none" />
    </svg>
  )
}
