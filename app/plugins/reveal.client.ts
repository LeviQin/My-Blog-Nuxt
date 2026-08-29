const revealSelector = [
  '.article-grid > .article-card',
  '.journal-article-grid > .journal-article-card',
  '.portfolio-grid > .project-card',
  '.about-project-grid > .about-project',
  '.links-grid > .link-card',
  '.lab-tool-grid > .lab-tool-card',
  '.lab-info-grid > .lab-info-card',
  '.journal-sidebar > .journal-card',
  '.archive-page .archive-list > .archive-year',
].join(', ')

export default defineNuxtPlugin((nuxtApp) => {
  let readyToScan = false
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const observer = reducedMotion.matches
    ? null
    : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer?.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })

  function scan() {
    document.querySelectorAll<HTMLElement>(revealSelector).forEach((element) => {
      if (element.dataset.revealBound) return
      element.dataset.revealBound = 'true'
      const siblings = [...(element.parentElement?.children || [])]
        .filter((sibling) => sibling.matches(revealSelector))
      element.style.setProperty('--reveal-index', String(Math.max(0, siblings.indexOf(element))))
      element.classList.add('reveal-item')
      if (!observer) element.classList.add('is-visible')
      else observer.observe(element)
    })
  }

  nuxtApp.hook('app:mounted', () => {
    window.setTimeout(() => {
      readyToScan = true
      scan()
    }, 400)
  })
  nuxtApp.hook('page:finish', () => {
    if (readyToScan) window.setTimeout(scan, 0)
  })
})
