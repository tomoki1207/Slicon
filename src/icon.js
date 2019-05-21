import md5 from 'blueimp-md5'
import Identicon from 'identicon.js'

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

export const replaceIconCss = async (tabId, { channel }) => {
  const id = channel.id
  const iconUrl = findIconUrl(channel) || generateDefaultIconUrl(channel)
  const css = `
    div#col_channels a.c-link.p-channel_sidebar__channel[href$="${id}"] > span.p-channel_sidebar__name:before {
      background: url(${iconUrl}) no-repeat center center;
      background-size: contain;
      animation: none;
    }`
  chrome.tabs.insertCSS(tabId, { code: css })
}

export const replaceAvatorCss = async (tabId, { im, user }) => {
  const id = user.id
  const css = `
    div#col_channels a.c-link.p-channel_sidebar__channel[href$="${im.id}"] > span.p-channel_sidebar__name:before {
      background: url(${user.profile.image_24}) no-repeat center center;
      background-size: contain;
      animation: none;
    }`
  chrome.tabs.insertCSS(tabId, { code: css })
}

export const replaceMultiMessageIconCss = async (tabId, { mpim }) => {
  const id = mpim.id
  const css = `
    div#col_channels a.c-link.p-channel_sidebar__channel[href$="${id}"] > span.p-channel_sidebar__name:before {
      background: url(${generateDefaultIconUrl(mpim)}) no-repeat center center;
      background-size: contain;
      animation: none;
    }`
  chrome.tabs.insertCSS(tabId, { code: css })
}
