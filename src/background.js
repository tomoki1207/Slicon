import { createHash } from 'crypto'
import Identicon from 'identicon.js'

const insertedCss = {}

const generateDefaultIconSrc = channel => {
  const sha = createHash('sha1')
  sha.update(channel.name)
  const hash = sha.digest('hex')
  const iconData = new Identicon(hash, { size: 21, format: 'svg' })
  return `data:image/svg+xml;base64,${iconData.toString()}`
}

const replaceIconCss = channel => {
  const id = channel.id
  if (insertedCss[id]) {
    browser.tabs.removeCSS({ code: insertedCss[id] })
  }
  const css = `
  div#col_channels a.c-link.p-channel_sidebar__channel[href$="${id}"] > span:before {
    background: url(${generateDefaultIconSrc(channel)}) no-repeat center center;
    background-size: contain;
    animation: none;
  }`
  browser.tabs.insertCSS({ code: css })
  insertedCss[id] = css
}

const replaceAvatorCss = (ims, user) => {
  const id = user.id
  if (insertedCss[id]) {
    browser.tabs.removeCSS({ code: insertedCss[id] })
  }
  const css = `
  div#col_channels a.c-link.p-channel_sidebar__channel[href$="${ims.id}"] > span:before {
    background: url(${user.profile.image_24}) no-repeat center center;
    background-size: contain;
    animation: none;
  }`
  browser.tabs.insertCSS({ code: css })
  insertedCss[id] = css
}

const trivialSleep = ms =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })

// request by serial with interval to avoid API limit.
const serial = async promises => {
  for (const p of promises) {
    try {
      await p()
      await trivialSleep(1500)
    } catch (e) {
      // noop
      console.log(e)
    }
  }
  return Promise.resolve()
}

const requestAsFormData = async (url, params) => {
  const searchParams = new URLSearchParams()
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      searchParams.append(key, params[key])
    }
  }
  return fetch(`${url}?${searchParams.toString()}`)
}

const fetchChannel = async (channel, origin, token) => {
  const param = {
    token,
    channel: channel.id
  }
  const url = `${origin}/api/channels.info`
  const response = await requestAsFormData(url, param)
  const body = await response.json()
  replaceIconCss(body.channel)
}

const fetchGroup = async (group, origin, token) => {
  const param = {
    token,
    channel: group.id
  }
  const url = `${origin}/api/groups.info`
  const response = await requestAsFormData(url, param)
  const body = await response.json()
  replaceIconCss(body.group)
}

const fetchProfile = async (ims, origin, token) => {
  const param = {
    token,
    channel: ims.id
  }
  const url = `${origin}/api/conversations.info`
  const response = await requestAsFormData(url, param)
  const body = await response.json()

  const userUrl = `${origin}/api/users.info`
  const userParam = {
    token,
    user: body.channel.user
  }
  const res = await requestAsFormData(userUrl, userParam)
  const json = await res.json()
  replaceAvatorCss(ims, json.user)
}

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
    const serialFetch = (props, fetchProc) => {
      if (props) {
        return serial(props.map(prop => async () => fetchProc(prop, requestUrl.origin, token)))
      }
      return Promise.resolve()
    }
    Promise.all([
      serialFetch(body.channels, fetchChannel),
      serialFetch(body.groups, fetchGroup),
      serialFetch(body.ims, fetchProfile)
    ])
  }
}

// peek request contains channels list
browser.webRequest.onBeforeRequest.addListener(
  listener,
  {
    urls: ['https://*.slack.com/api/client.counts*']
  },
  ['blocking', 'requestBody']
)
