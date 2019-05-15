const requestAsFormData = async (url, params) => {
  const searchParams = new URLSearchParams()
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      searchParams.append(key, params[key])
    }
  }
  return fetch(`${url}?${searchParams.toString()}`)
}

// fetch channel info
// TODO: should use /conversations.info instead
export const fetchChannel = async (channel, origin, token) => {
  const param = {
    token,
    channel: channel.id
  }
  const url = `${origin}/api/channels.info`
  const response = await requestAsFormData(url, param)
  const json = await response.json()
  return { channel: json.channel }
}

// fetch group (means private channels) info
// TODO: should use /conversations.info instead
export const fetchGroup = async (group, origin, token) => {
  const param = {
    token,
    channel: group.id
  }
  const url = `${origin}/api/groups.info`
  const response = await requestAsFormData(url, param)
  const json = await response.json()
  return { channel: json.group }
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
  return { ims: im, user: json.user }
}

export const fetchProfileAsConversation = async (ims, origin, token) => {
  const im = await fetchConversation(ims, origin, token)
  return fetchProfile(im.channel, origin, token)
}
