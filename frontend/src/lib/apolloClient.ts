import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client"
import { onError } from "@apollo/client/link/error"

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL as string

const errorLink = onError(({ graphQLErrors, networkError }: any) => {
    if (networkError) {
        console.warn(`[Network error]: ${networkError}`)
    }
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }: any) =>
            console.log(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
            ),
        )
    }
})

const httpLink = new HttpLink({
    uri: SUBGRAPH_URL,
    fetch: async (uri, options) => {
        try {
            const response = await fetch(uri, options)
            if (response.status === 429) {
                // Return a mock SUCCESS response on Rate Limit to silent the error
                // Return empty array so UI treats it as "no data" but not "error"
                return new Response(
                    JSON.stringify({
                        data: {
                            stakingStats: [],
                        },
                    }),
                    {
                        status: 200,
                        headers: response.headers,
                    },
                )
            }
            return response
        } catch (error) {
            console.error("Network Fetch Error:", error)
            throw error
        }
    },
})

const client = new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
})

export default client
