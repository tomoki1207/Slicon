// request by serial with interval to avoid API limit.
const delay = async x =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(x)
    }, 1500)
  })

const serial = async promises => {
  for (const p of promises) {
    try {
      await p()
      await delay()
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
  // console.log(body.channel)
}

const fetchGroup = async (group, origin, token) => {
  const param = {
    token,
    channel: group.id
  }
  const url = `${origin}/api/groups.info`
  const response = await requestAsFormData(url, param)
  const body = await response.json()
  // console.log(body.group)
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
    Promise.all([
      serial(
        body.channels.map(channel => async () =>
          fetchChannel(channel, requestUrl.origin, token)
        )
      ),
      serial(
        body.groups.map(group => async () =>
          fetchGroup(group, requestUrl.origin, token)
        )
      )
    ])
  }
}

// peek request contains channels list
browser.webRequest.onBeforeRequest.addListener(
  listener,
  {
    urls: ['https://*.slack.com/api/users.counts*']
  },
  ['blocking', 'requestBody']
)
