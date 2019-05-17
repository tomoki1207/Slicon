/*
 * handy storage access
 */

export const get = async key => {
  const val = await chrome.storage.local.get(key)
  return key ? val[key] : val
}

export const set = async (key, value) => {
  const val = (await get()) || {}
  val[key] = value
  return chrome.storage.local.set(val)
}
