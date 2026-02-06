import {ApolloClient, InMemoryCache, HttpLink} from "@apollo/client"

const GRAPH_URL = "https://api.studio.thegraph.com/query/1740311/aether-staking-vault/version/latest"

const client = new ApolloClient({
    link: new HttpLink({
        uri: GRAPH_URL,
        fetch
    }),
    cache: new InMemoryCache(),
})

export default client