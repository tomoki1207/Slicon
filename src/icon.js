import { createHash } from 'crypto'
import Identicon from 'identicon.js'

// icon format: __icon[https://your.icon.host/someimage.png]
const iconRegex = /^__icon\[<(.+)>\]$/
const insertedCss = {}

// show identicon if icon isn't set
const generateDefaultIconUrl = channel => {
  const sha = createHash('sha1')
  sha.update(channel.name)
  const hash = sha.digest('hex')
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

export const replaceIconCss = ({ channel }) => {
  const id = channel.id
  if (insertedCss[id]) {
    browser.tabs.removeCSS({ code: insertedCss[id] })
  }
  const iconUrl = findIconUrl(channel) || generateDefaultIconUrl(channel)
  const css = `
    div#col_channels a.c-link.p-channel_sidebar__channel[href$="${id}"] > span:before {
      background: url(${iconUrl}) no-repeat center center;
      background-size: contain;
      animation: none;
    }`
  browser.tabs.insertCSS({ code: css })
  insertedCss[id] = css
}

export const replaceAvatorCss = ({ ims, user }) => {
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

export const replaceMultiMessageIconCss = ({ mpims }) => {
  const id = mpims.id
  if (insertedCss[id]) {
    browser.tabs.removeCSS({ code: insertedCss[id] })
  }
  const css = `
    div#col_channels a.c-link.p-channel_sidebar__channel[href$="${id}"] > span:before {
      background: url(${generateDefaultIconUrl(mpims)}) no-repeat center center;
      background-size: contain;
      animation: none;
    }`
  browser.tabs.insertCSS({ code: css })
  insertedCss[id] = css
}
