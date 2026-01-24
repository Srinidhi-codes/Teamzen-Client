import { ApolloClient, InMemoryCache, createHttpLink, Observable } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { refreshAuthToken } from "./api/client";

// Polyfill fromPromise if not available
const fromPromise = <T>(promise: Promise<T>): Observable<T> => {
  return new Observable<T>((observer) => {
    promise
      .then((value) => {
        observer.next(value);
        observer.complete();
      })
      .catch((err) => {
        observer.error(err);
      });
  });
};

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

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }: any) => {
  const isUnauthorized =
    (graphQLErrors &&
      graphQLErrors.some(
        (e: any) =>
          e.message === "Unauthenticated" ||
          e.extensions?.code === "UNAUTHENTICATED" ||
          e.message.toLowerCase().includes("signature has expired")
      )) ||
    (networkError &&
      "statusCode" in networkError &&
      networkError.statusCode === 401);

  if (isUnauthorized) {
    return new Observable((observer) => {
      refreshAuthToken()
        .then(() => {
          const subscriber = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });
          
          return () => {
             if (subscriber.unsubscribe) subscriber.unsubscribe();
          };
        })
        .catch((error) => {
          // ❌ Refresh failed → session expired
          // Clear global store
          import("@/lib/store/useStore").then(({ useStore }) => {
            useStore.getState().logoutUser();
          });

          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }

          observer.error(error);
        });
    });
  }
});

export const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache(),
});
