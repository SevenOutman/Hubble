import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'

// @see https://github.com/apollographql/apollo-client/issues/2168#issuecomment-334122648
const httpLink = ApolloLink.from([
  (operation, forward) => {
    operation.setContext(context => ({
      ...context,
      headers: {
        ...context.headers,
        Authorization: `token ${localStorage.getItem('access_token')}`
      }
    }))
    return forward(operation)
  },
  new HttpLink({
    // You should use an absolute URL here
    uri: 'https://api.github.com/graphql'
  })
])

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})

// Install the vue plugin
Vue.use(VueApollo)

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

export default apolloProvider.provide()
