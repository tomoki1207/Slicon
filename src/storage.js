/*
 * handy storage access
 */

export const get = async key => {
  const val = await getAsync(key)
  return key ? val[key] : val
}

export const set = async (key, value) => {
  const val = (await getAsync()) || {}
  val[key] = value
  return setAsync(val)
}

const getAsync = key =>
  new Promise((resolve, reject) => {
    chrome.storage.local.get(key, result => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
        return
      }
      resolve(result)
    })
  })

const setAsync = keyValue =>
  new Promise((resolve, reject) => {
    chrome.storage.local.set(keyValue, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
        return
      }
      resolve()
    })
  })
