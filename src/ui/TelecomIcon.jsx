export default function TelecomIcon({ name, size = 20 }) {
  const sharedProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  if (name === 'dashboard') {
    return (
      <svg {...sharedProps}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="4" rx="1" />
        <rect x="14" y="11" width="7" height="10" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    )
  }

  if (name === 'modules') {
    return (
      <svg {...sharedProps}>
        <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
        <path d="m4 12 8 4.5 8-4.5" />
        <path d="m4 16.5 8 4.5 8-4.5" />
      </svg>
    )
  }

  if (name === 'lab') {
    return (
      <svg {...sharedProps}>
        <path d="M8 3h8" />
        <path d="M10 3v6l-5.5 9.2A1.8 1.8 0 0 0 6 21h12a1.8 1.8 0 0 0 1.5-2.8L14 9V3" />
        <path d="M7.5 16h9" />
      </svg>
    )
  }

  if (name === 'results') {
    return (
      <svg {...sharedProps}>
        <path d="M4 20V10" />
        <path d="M10 20V4" />
        <path d="M16 20v-7" />
        <path d="M22 20H2" />
      </svg>
    )
  }

  if (name === 'rj45') {
    return (
      <svg {...sharedProps}>
        <path d="M7 4h10v5l3 3v8H4v-8l3-3V4Z" />
        <path d="M8 4v4M11 4v4M14 4v4M17 4v4" />
        <path d="M8 15h8" />
      </svg>
    )
  }

  if (name === 'fiber') {
    return (
      <svg {...sharedProps}>
        <path d="M3 7h6c2.2 0 3.4 1.2 3.4 3s-1.2 3-3.4 3H6" />
        <path d="M21 17h-6c-2.2 0-3.4-1.2-3.4-3s1.2-3 3.4-3h3" />
        <circle cx="4" cy="13" r="1.5" />
        <circle cx="20" cy="11" r="1.5" />
      </svg>
    )
  }

  if (name === 'network') {
    return (
      <svg {...sharedProps}>
        <rect x="7" y="3" width="10" height="5" rx="1" />
        <rect x="3" y="16" width="6" height="5" rx="1" />
        <rect x="15" y="16" width="6" height="5" rx="1" />
        <path d="M12 8v4M6 16v-4h12v4" />
      </svg>
    )
  }

  if (name === 'user') {
    return (
      <svg {...sharedProps}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    )
  }

  if (name === 'settings') {
    return (
      <svg {...sharedProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </svg>
    )
  }

  if (name === 'help') {
    return (
      <svg {...sharedProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.7 9a2.5 2.5 0 1 1 4.2 1.8c-1 .9-1.9 1.3-1.9 2.7" />
        <path d="M12 17h.01" />
      </svg>
    )
  }

  if (name === 'logout') {
    return (
      <svg {...sharedProps}>
        <path d="M10 4H5v16h5" />
        <path d="m15 8 4 4-4 4" />
        <path d="M8 12h11" />
      </svg>
    )
  }

  return (
    <svg {...sharedProps}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
