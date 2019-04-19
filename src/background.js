const listener = detail => {
  const filter = browser.webRequest.filterResponseData(detail.requestId)
  const decoder = new TextDecoder('utf-8')

  filter.ondata = event => {
    const payload = decoder.decode(event.data, { stream: true })
    console.log(payload)
    filter.write(event.data)
    filter.disconnect()
  }

  filter.onstop = event => {
    filter.close()
  }
}

browser.webRequest.onBeforeRequest.addListener(
  listener,
  {
    urls: ['https://*.slack.com/*']
  },
  ['blocking']
)
