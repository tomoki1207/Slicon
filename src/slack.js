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

export const fetchProfile = async (ims, origin, token) => {
  const param = {
    token,
    channel: ims.id
  }
  const url = `${origin}/api/conversations.info`
  const response = await requestAsFormData(url, param)
  const body = await response.json()

  const userUrl = `${origin}/api/users.info`
  const userParam = {
    token,
    user: body.channel.user
  }
  const res = await requestAsFormData(userUrl, userParam)
  const json = await res.json()
  return { ims, user: json.user }
}
