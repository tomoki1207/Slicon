const requestAsFormData = async (url, params) => {
  const searchParams = new URLSearchParams()
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      searchParams.append(key, params[key])
    }
  }
  return fetch(`${url}?${searchParams.toString()}`)
}

// fetch conversations
export const fetchConversations = async (origin, token, cursor) => {
  const param = {
    token,
    exclude_archived: true,
    types: 'public_channel,private_channel,im,mpim'
  }
  if (cursor) {
    param.cursor = cursor
  }
  const url = `${origin}/api/conversations.list`
  const response = await requestAsFormData(url, param)
  const json = await response.json()

  const ims = []
  const mpims = []
  const channels = []
  for (const channel of json.channels) {
    if (channel.is_im) {
      ims.push(channel)
    } else if (channel.is_mpim) {
      mpims.push(channel)
    } else {
      channels.push(channel)
    }
  }
  let ret = { channels, ims, mpims }
  if (json.response_metadata.next_cursor !== '') {
    const next = await fetchConversations(origin, token, json.response_metadata.next_cursor)
    ret = {
      channels: ret.channels.concat(next.channels),
      ims: ret.ims.concat(next.ims),
      mpims: ret.mpims.concat(next.mpims)
    }
  }
  return ret
}

export const fetchConversation = async (channel, origin, token) => {
  const param = {
    token,
    channel: channel.id
  }
  const url = `${origin}/api/conversations.info`
  const response = await requestAsFormData(url, param)
  const json = await response.json()
  return { channel: json.channel }
}

export const fetchProfile = async (im, origin, token) => {
  const url = `${origin}/api/users.info`
  const param = {
    token,
    user: im.user
  }
  const res = await requestAsFormData(url, param)
  const json = await res.json()
  return { im, user: json.user }
}

export const fetchProfileAsConversation = async (ims, origin, token) => {
  const im = await fetchConversation(ims, origin, token)
  return fetchProfile(im.channel, origin, token)
}
