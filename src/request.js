import axios from 'axios'

export const restRequest = (url, options = {}) => {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
  }
  const token = localStorage.getItem('access_token')
  if (token) {
    headers.Authorization = `token ${token}`
  }
  return axios(url, {
    baseURL: 'https://api.github.com',
    headers,
    ...options
  })
}

export const graphqlRequest = (query, variables) => {
  return axios(`/graphql`, {
    baseURL: 'https://api.github.com',
    method: 'post',
    data: {
      query,
      variables
    },
    headers: {
      Authorization: `bearer ${localStorage.getItem('access_token')}`,
    },
  })
}
