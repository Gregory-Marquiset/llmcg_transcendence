const BASE_URL = '/api/v1/users/friends'

export async function addFriend(userId, token) {
  const res = await fetch(`${BASE_URL}/${userId}/request`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) throw new Error('Add friend failed')
  return res.json()
}

export async function respondToFriendRequest(senderId, action, token) {
  const res = await fetch(`${BASE_URL}/${senderId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action
    })
  })

  if (!res.ok) {
    throw new Error('Friend request response failed')
  }

  return res.json()
}


export async function deleteFriend(userId, token) {
  const res = await fetch(`${BASE_URL}/${userId}/delete`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) throw new Error('Delete friend failed')
  return res.json()
}

export async function blockUser(userId, token) {
  const res = await fetch(`${BASE_URL}/${userId}/block`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) throw new Error('Block failed')
  return res.json()
}

export async function unblockUser(userId, token) {
  const res = await fetch(`${BASE_URL}/${userId}/unblock`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) throw new Error('Unblock failed')
  return res.json()
}

export async function getUserProfile(username, token) {
  const res = await fetch(`/api/v1/users/user/${username}/profil`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch profile')
  }
  return res.json()
}

export async function getCurrUserProfile(token)
{
     const res = await fetch(`http://localhost:5000/api/v1/auth/me`, {
        method : 'GET',
        headers : {
          'Authorization' : `Bearer ${token}`
        }
      })
    if (!res.ok) {
        throw new Error('Failed to fetch profile')
    }
    return res.json()
}

export async function getFriendList(token)
{
     const res = await fetch(`${BASE_URL}/list`, {
        method : 'GET',
        headers : {
          'Authorization' : `Bearer ${token}`
        }
      })
    if (!res.ok) {
        throw new Error('Failed to fetch friend list')
    }
    return res.json()
}

export async function getRequestList(token)
{
     const res = await fetch(`${BASE_URL}/requestList`, {
        method : 'GET',
        headers : {
          'Authorization' : `Bearer ${token}`
        }
      })
    if (!res.ok) {
        throw new Error('Failed to fetch requestlist')
    }
    return res.json()
}

