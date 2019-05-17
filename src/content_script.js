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

// request restore once when appear channel sidebar
waitForReady('div.p-channel_sidebar__static_list').then(target => chrome.runtime.sendMessage({ action: 'restore' }))
