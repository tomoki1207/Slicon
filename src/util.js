// simulate sleep
const trivialSleep = ms =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })

// request by serial with interval to avoid API limit.
export const serial = async promises => {
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
