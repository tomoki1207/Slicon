import { trivialSleep } from './util'
import { fetchConversations, fetchConversation, fetchProfileAsConversation, fetchProfile } from './slack'
import { restoreCss, replaceIconCss, replaceAvatorCss, replaceMultiMessageIconCss } from './icon'

const parse = (detail, callback) => {
  const url = new URL(detail.url)
  const data = detail.requestBody.formData
  callback({ url, data })
}

const initializeAllChannels = detail => {
  parse(detail, async ({ url, data }) => {
    const { channels, ims, mpims } = await fetchConversations(url.origin, data.token)
    channels.forEach(channel => replaceIconCss({ channel }))
    ims.forEach(async im => {
      const profile = await fetchProfile(im, url.origin, data.token)
      replaceAvatorCss(profile)
    })
    mpims.forEach(mpim => replaceMultiMessageIconCss({ mpim }))
  })
}

const updateChannelPurpose = detail => {
  parse(detail, async ({ url, data }) => {
    // wait for complete request
    await trivialSleep(1000)
    const channel = await fetchConversation({ id: data.channel }, url.origin, data.token)
    replaceIconCss(channel)
  })
}

const updateChannel = detail => {
  parse(detail, async ({ url, data }) => {
    const { channel } = await fetchConversation({ id: data.channel }, url.origin, data.token)
    if (!channel.is_im) {
      replaceIconCss({ channel })
      return
    }
    const profile = await fetchProfile(channel, url.origin, data.token)
    replaceAvatorCss(profile)
  })
}

// peek request contains channels list
chrome.webRequest.onBeforeRequest.addListener(
  initializeAllChannels,
  {
    urls: ['https://*.slack.com/api/client.counts*', 'https://*.slack.com/api/users.counts*']
  },
  ['requestBody']
)
// update icon when set purpose immediately
chrome.webRequest.onBeforeRequest.addListener(
  updateChannelPurpose,
  {
    urls: ['https://*.slack.com/api/conversations.setPurpose*']
  },
  ['requestBody']
)
// update icon when show/preview channel
chrome.webRequest.onBeforeRequest.addListener(
  updateChannel,
  {
    urls: ['https://*.slack.com/api/conversations.history*']
  },
  ['requestBody']
)

chrome.runtime.onMessage.addListener(async msg => {
  // initialize css on receive message from content_script
  if (msg.action === 'restore') {
    await restoreCss()
  }
})
