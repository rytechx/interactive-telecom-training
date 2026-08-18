import { useEffect } from 'react'

export default function useLandingReveal(pageRef) {
  useEffect(() => {
    const page = pageRef.current
    if (!page) return undefined

    const revealElements = [...page.querySelectorAll('[data-reveal]')]
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || document.documentElement.classList.contains('settings-reduced-motion')

    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach((element) => element.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      {
        root: page,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.08,
      },
    )

    revealElements.forEach((element) => observer.observe(element))
    page.classList.add('is-reveal-ready')

    return () => observer.disconnect()
  }, [pageRef])
}
