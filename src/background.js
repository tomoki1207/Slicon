import { serial } from './util'
import { fetchChannel, fetchGroup, fetchProfile } from './slack'
import { restoreCss, replaceIconCss, replaceAvatorCss, replaceMultiMessageIconCss } from './icon'

// listen onBeforeRequest
const listen = (detail, callback) => {
  const filter = browser.webRequest.filterResponseData(detail.requestId)
  const decoder = new TextDecoder('utf-8')
  const url = new URL(detail.url)
  const token = detail.requestBody.formData.token

  let buffer = ''
  filter.ondata = event => {
    const payload = decoder.decode(event.data, { stream: true })
    // return response as is.
    filter.write(event.data)
    buffer += payload
  }

  filter.onstop = event => {
    filter.disconnect()
    const body = JSON.parse(buffer)
    callback({ url, token, body })
  }
}

const initializeAllChannels = detail => {
  listen(detail, ({ url, token, body }) => {
    const serialFetch = (props, fetchProc, callback) => {
      if (props) {
        return serial(
          props.map(prop => async () => {
            const result = await fetchProc(prop, url.origin, token)
            callback(result)
          })
        )
      }
      return Promise.resolve()
    }
    Promise.all([
      serialFetch(body.channels, fetchChannel, replaceIconCss),
      serialFetch(body.groups, fetchGroup, replaceIconCss),
      serialFetch(body.ims, fetchProfile, replaceAvatorCss),
      serialFetch(body.mpims, (mpims, _, __) => Promise.resolve({ mpims }), replaceMultiMessageIconCss)
    ])
  })
}

const updateChannel = async detail => {
  listen(detail, ({ body }) => {
    replaceIconCss({ channel: body.channel })
  })
}

// peek request contains channels list
browser.webRequest.onBeforeRequest.addListener(
  initializeAllChannels,
  {
    urls: ['https://*.slack.com/api/client.counts*', 'https://*.slack.com/api/users.counts*']
  },
  ['blocking', 'requestBody']
)
// update icon when set purpose immediately
browser.webRequest.onBeforeRequest.addListener(
  updateChannel,
  {
    urls: ['https://*.slack.com/api/conversations.setPurpose*']
  },
  ['blocking', 'requestBody']
)

browser.runtime.onMessage.addListener(async msg => {
  // initialize css on receive message from content_script
  if (msg.action === 'restore') {
    await restoreCss()
  }
})
