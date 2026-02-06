import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || ""

const client = new ApolloClient({
    link: new HttpLink({
        uri: SUBGRAPH_URL,
        fetch,
    }),
    cache: new InMemoryCache(),
})

export default client
