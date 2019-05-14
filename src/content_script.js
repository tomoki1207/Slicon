const waitForReady = selector =>
  new Promise(resolve => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }
    new MutationObserver((_, observer) => {
      for (const el of Array.from(document.querySelectorAll(selector))) {
        resolve(el)
        observer.disconnect()
        return
      }
    }).observe(document, {
      childList: true,
      subtree: true
    })
  })

waitForReady('div.p-channel_sidebar__static_list').then(target =>
  new MutationObserver(records => {
    console.log('call', records)
    // request restore icons
    browser.runtime.sendMessage({ action: 'restore' })
  }).observe(target, {
    childList: true,
    subtree: true
  })
)
