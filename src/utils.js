import axios from 'axios'
import parseLinkHeader from 'parse-link-header'

function noop() {
}

export function restFetchStargazers(fullname, {
  onPageData = noop,
  onError = noop,
  onComplete = noop,
}) {

  function fetchStargazersByPage(page = 1) {
    let fullData = []

    return axios(`/repos/${fullname}/stargazers`, {
      baseURL: 'https://api.github.com',
      params: {
        page,
        per_page: 100,
      },
      headers: {
        Accept: 'application/vnd.github.v3.star+json',
        Authorization: `token ${localStorage.getItem('access_token')}`,
      },
    }).then(({ headers, data }) => {

      fullData = [...fullData, ...data]
      onPageData(data)
      const links = parseLinkHeader(headers['link'])
      if (links && links.next && +links.next.page) {
        fetchStargazersByPage(+links.next.page)
      } else {
        onComplete(fullData)
      }
      return data
    })
  }


  return fetchStargazersByPage(1).catch(onError)
}

export function graphqlFetchStargazers(owner, name, {
  onPageData = noop,
  onError = noop,
  onComplete = noop,
}) {

  const query = `
          query RepoStars($owner: String!, $name: String!, $afterPointer: String) {
            repository(owner: $owner, name: $name) {
              createdAt
              stargazers(after: $afterPointer, first: 100) {
                edges {
                  starredAt
                },
                pageInfo {
                  endCursor
                  hasPreviousPage
                  hasNextPage
                }
                totalCount
              }
            }
          }
        `

  function fetchStargazersByPage(afterPointer = null) {
    let fullData = []

    return axios(`/graphql`, {
      baseURL: 'https://api.github.com',
      method: 'post',
      data: {
        query,
        variables: { owner, name, afterPointer },
      },
      headers: {
        Authorization: `token ${localStorage.getItem('access_token')}`,
      },
    }).then(({ data: { data: { repository: { stargazers: { edges, pageInfo: { endCursor, hasNextPage } } } } } }) => {
      fullData = [...fullData, ...edges]
      onPageData(edges)
      if (hasNextPage) {
        fetchStargazersByPage(endCursor)
      } else {
        onComplete(fullData)
      }
      return edges
    })
  }


  return fetchStargazersByPage().catch(onError)
}
