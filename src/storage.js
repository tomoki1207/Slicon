/*
 * handy storage access
 */

const empty = obj => !obj || Object.keys(obj).length <= 0

export const get = async key => {
  const val = await browser.storage.local.get(key)
  return empty(val) ? null : val[key]
}

export const set = async (key, value) => {
  const val = (await get()) || {}
  val[key] = value
  return browser.storage.local.set(val)
}
