import { serial } from './util'
import { fetchChannel, fetchGroup, fetchProfile } from './slack'
import { replaceIconCss, replaceAvatorCss, replaceMultiMessageIconCss } from './icon'

const listener = detail => {
  const filter = browser.webRequest.filterResponseData(detail.requestId)
  const decoder = new TextDecoder('utf-8')
  const requestUrl = new URL(detail.url)
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
    const serialFetch = (props, fetchProc, callback) => {
      if (props) {
        return serial(
          props.map(prop => async () => {
            const result = await fetchProc(prop, requestUrl.origin, token)
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
  }
}

// peek request contains channels list
browser.webRequest.onBeforeRequest.addListener(
  listener,
  {
    urls: ['https://*.slack.com/api/client.counts*', 'https://*.slack.com/api/users.counts*']
  },
  ['blocking', 'requestBody']
)
