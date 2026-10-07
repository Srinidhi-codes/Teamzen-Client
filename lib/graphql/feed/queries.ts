import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query GetPosts($page: Int!, $pageSize: Int!, $authorId: String) {
    posts(page: $page, pageSize: $pageSize, authorId: $authorId) {
      results {
        id
        title
        content
        mediaUrls
        likesCount
        commentsCount
        viewsCount
        createdAt
        hasLiked
        likers {
          id
          firstName
          lastName
          profilePictureUrl
        }
        author {
          id
          firstName
          lastName
          email
          profilePictureUrl
        }
      }
      total
      page
      pageSize
    }
  }
`;

export const GET_POST_COMMENTS = gql`
  fragment CommentFields on CommentType {
    id
    content
    likesCount
    createdAt
    hasLiked
    author {
      id
      firstName
      lastName
      email
      profilePictureUrl
    }
  }

  query GetPostComments($postId: String!, $limit: Int = 5, $offset: Int = 0) {
    post(id: $postId) {
      id
      topLevelCommentsCount
      comments(limit: $limit, offset: $offset) {
        ...CommentFields
        replies {
          ...CommentFields
          replies {
            ...CommentFields
            replies {
              ...CommentFields
              replies {
                ...CommentFields
                replies {
                  ...CommentFields
                }
              }
            }
          }
        }
      }
    }
  }
`;
