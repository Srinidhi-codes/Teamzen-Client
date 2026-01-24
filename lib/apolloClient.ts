import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql/",
  credentials: "include", // Ensures cookies are sent with requests
});

const authLink = setContext((_, { headers }) => {
  let csrftoken = "";
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'));
    if (match) {
      csrftoken = match[2];
    }
  }

  return {
    headers: {
      ...headers,
      "X-CSRFToken": csrftoken,
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
