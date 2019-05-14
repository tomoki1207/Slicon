/*
 * handy storage access
 */

export const get = async key => {
  const val = await browser.storage.local.get(key)
  return key ? val[key] : val
}

export const set = async (key, value) => {
  const val = (await get()) || {}
  val[key] = value
  return browser.storage.local.set(val)
}
