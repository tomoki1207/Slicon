import md5 from 'blueimp-md5'
import Identicon from 'identicon.js'

import { get, set } from './storage'

// icon format: __icon[https://your.icon.host/someimage.png]
const iconRegex = /^__icon\[<(.+)>\]$/

// show identicon if icon isn't set
const generateDefaultIconUrl = channel => {
  const hash = md5(channel.name)
  const iconData = new Identicon(hash, { size: 21, format: 'svg' })
  return `data:image/svg+xml;base64,${iconData.toString()}`
}

const findIconUrl = channel => {
  // find icon url from purpose
  const purpose = channel.purpose.value.split(/\r?\n/)
  for (const line of purpose) {
    const m = line.match(iconRegex)
    if (m) {
      return m[1]
    }
  }
  return null
}

export const replaceIconCss = async ({ channel }) => {
  const id = channel.id
  const prev = await get(id)
  if (prev) {
    chrome.tabs.removeCSS({ code: prev })
  }
  const iconUrl = findIconUrl(channel) || generateDefaultIconUrl(channel)
  const css = `
    div#col_channels a.c-link.p-channel_sidebar__channel[href$="${id}"] > span.p-channel_sidebar__name:before {
      background: url(${iconUrl}) no-repeat center center;
      background-size: contain;
      animation: none;
    }`
  chrome.tabs.insertCSS({ code: css })
  set(id, css)
}

export const replaceAvatorCss = async ({ ims, user }) => {
  const id = user.id
  const prev = await get(id)
  if (prev) {
    chrome.tabs.removeCSS({ code: prev })
  }
  const css = `
    div#col_channels a.c-link.p-channel_sidebar__channel[href$="${ims.id}"] > span.p-channel_sidebar__name:before {
      background: url(${user.profile.image_24}) no-repeat center center;
      background-size: contain;
      animation: none;
    }`
  chrome.tabs.insertCSS({ code: css })
  set(id, css)
}

export const replaceMultiMessageIconCss = async ({ mpims }) => {
  const id = mpims.id
  const prev = await get(id)
  if (prev) {
    chrome.tabs.removeCSS({ code: prev })
  }
  const css = `
    div#col_channels a.c-link.p-channel_sidebar__channel[href$="${id}"] > span.p-channel_sidebar__name:before {
      background: url(${generateDefaultIconUrl(mpims)}) no-repeat center center;
      background-size: contain;
      animation: none;
    }`
  chrome.tabs.insertCSS({ code: css })
  set(id, css)
}

export const restoreCss = async () => {
  const wholeCss = await get()
  if (wholeCss) {
    // insert one by one for enable to removeCss()
    for (const css of Object.values(wholeCss)) {
      chrome.tabs.insertCSS({ code: css })
    }
  }
}
