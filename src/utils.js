import axios from 'axios'
import parseLinkHeader from 'parse-link-header'
import { graphqlRequest } from '@/request';

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
        Authorization: `bearer ${localStorage.getItem('access_token')}`,
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

export function fetchStargazerCount(fullname) {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
  }
  const token = localStorage.getItem('access_token')
  if (token) {
    headers.Authorization = `token ${token}`
  }
  return axios(`/repos/${fullname}`, {
    baseURL: 'https://api.github.com',
    headers
  }).then(({ data: { stargazers_count } }) => stargazers_count)
}

export function graphqlFetchStargazerCount(owner, name) {
  const query = `
  query Repo($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      stargazers(last: 1) {
        edges {
          starredAt
          node {
            login
          }
        }
        totalCount
      }
    }
  }`
  return axios(`/graphql`, {
    baseURL: 'https://api.github.com',
    method: 'post',
    data: {
      query,
      variables: { owner, name },
    },
    headers: {
      Authorization: `bearer ${localStorage.getItem('access_token')}`,
    },
  }).then(({ data: { errors, data } }) => {
    if (errors) {
      return Promise.reject(errors)
    }
    const { repository: { stargazers: { totalCount, edges } } } = data
    return { total: totalCount, last: edges[0] }
  })

}

export function graphqlFetchViewerBestarredRepos(
  {
    onPageData = noop,
    onComplete = noop,
    onError = noop
  }) {

  const query = `
    query ViewerRepos($after: String) {
      viewer {
        login
        repositories(first: 100, after: $after, orderBy: { field: STARGAZERS, direction: DESC }) {
          nodes {
            nameWithOwner
            stargazers(first: 1, orderBy: { direction: DESC, field: STARRED_AT }) {
              edges {
                starredAt
              }
              totalCount
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  `

  const year = (new Date()).getFullYear()
  let viewer = ''
  let repositories = []

  function fetchReposByPage(after = null) {

    return graphqlRequest(query, { after })
      .then(({ data: { data: { viewer: { login, repositories: { nodes, pageInfo: { endCursor, hasNextPage } } } } } }) => {
        viewer = viewer || login
        const bestarredRepos = nodes.filter(({ stargazers: { totalCount } }) => totalCount > 0)
        const bestarredThisYear = bestarredRepos.filter(({ stargazers: { edges } }) => {
          const edge = edges[0]
          return edge && edge.starredAt.substr(0, 4) === `${year}`
        })
        repositories = [...repositories, ...bestarredThisYear]
        onPageData({ viewer, repositories })
        if (hasNextPage && bestarredRepos.length === nodes.length) {
          fetchReposByPage(endCursor)
        } else {
          onComplete({ viewer, repositories })
        }
        return repositories
      })
  }


  return fetchReposByPage().catch(onError)
}


export function graphqlFetchRepoStarsThisYear(owner, name, {
  onPageData = noop,
  onComplete = noop,
  onError = noop
}) {

  const query = `
    query RepoStars($owner: String!, $name: String!, $after: String) {
      repository(owner: $owner, name: $name) {
        stargazers(after: $after, first: 100, orderBy: { direction: DESC, field: STARRED_AT }) {
          edges {
            starredAt
          }
          pageInfo {
            endCursor
            hasPreviousPage
            hasNextPage
          }
        }
      }
    }
  `

  const year = (new Date()).getFullYear()
  let fullData = []

  function fetchStargazersAfter(after = null) {

    return graphqlRequest(query, { owner, name, after })
      .then(({ data: { data: { repository: { stargazers: { edges, pageInfo: { hasNextPage, endCursor } } } } } }) => {
        const starsThisYear = edges.map(edge => edge.starredAt).filter(isoDate => isoDate.substr(0, 4) === `${year}`)
        fullData = [...fullData, ...starsThisYear]
        onPageData(starsThisYear)
        if (hasNextPage && starsThisYear.length === edges.length) {
          fetchStargazersAfter(endCursor)
        } else {
          onComplete(fullData)
        }
        return fullData
      })
  }


  return fetchStargazersAfter().catch(onError)
}
