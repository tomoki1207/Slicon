import { serial } from './util'
import { fetchChannel, fetchGroup, fetchConversation, fetchProfileAsConversation, fetchProfile } from './slack'
import { restoreCss, replaceIconCss, replaceAvatorCss, replaceMultiMessageIconCss } from './icon'

// listen onBeforeRequest
const listen = (detail, callback) => {
  const filter = chrome.webRequest.filterResponseData(detail.requestId)
  const decoder = new TextDecoder('utf-8')
  const url = new URL(detail.url)
  const data = detail.requestBody.formData

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
    callback({ url, data, body })
  }
}

const initializeAllChannels = detail => {
  listen(detail, ({ url, data, body }) => {
    const serialFetch = (props, fetchProc, callback) => {
      if (props) {
        return serial(
          props.map(prop => async () => {
            const result = await fetchProc(prop, url.origin, data.token)
            callback(result)
          })
        )
      }
      return Promise.resolve()
    }
    Promise.all([
      serialFetch(body.channels, fetchChannel, replaceIconCss),
      serialFetch(body.groups, fetchGroup, replaceIconCss),
      serialFetch(body.ims, fetchProfileAsConversation, replaceAvatorCss),
      serialFetch(body.mpims, (mpims, _, __) => Promise.resolve({ mpims }), replaceMultiMessageIconCss)
    ])
  })
}

const updateChannelPurpose = detail => {
  listen(detail, ({ body }) => {
    replaceIconCss({ channel: body.channel })
  })
}

const updateChannel = detail => {
  listen(detail, async ({ url, data }) => {
    const origin = url.origin
    const token = data.token
    const { channel } = await fetchConversation({ id: data.channel }, origin, token)
    if (!channel.is_im) {
      replaceIconCss({ channel })
      return
    }
    const profile = await fetchProfile(channel, origin, token)
    replaceAvatorCss(profile)
  })
}

// peek request contains channels list
chrome.webRequest.onBeforeRequest.addListener(
  initializeAllChannels,
  {
    urls: ['https://*.slack.com/api/client.counts*', 'https://*.slack.com/api/users.counts*']
  },
  ['blocking', 'requestBody']
)
// update icon when set purpose immediately
chrome.webRequest.onBeforeRequest.addListener(
  updateChannelPurpose,
  {
    urls: ['https://*.slack.com/api/conversations.setPurpose*']
  },
  ['blocking', 'requestBody']
)
// update icon when show/preview channel
chrome.webRequest.onBeforeRequest.addListener(
  updateChannel,
  {
    urls: ['https://*.slack.com/api/conversations.history*']
  },
  ['blocking', 'requestBody']
)

chrome.runtime.onMessage.addListener(async msg => {
  // initialize css on receive message from content_script
  if (msg.action === 'restore') {
    await restoreCss()
  }
})
