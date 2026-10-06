import { gql } from "@apollo/client";

export const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!, $mediaB64: [String!]) {
    createPost(title: $title, content: $content, mediaB64: $mediaB64) {
      id
      title
      content
      mediaUrls
      likesCount
      commentsCount
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
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: String!) {
    deletePost(id: $id)
  }
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($id: String!, $content: String!, $title: String) {
    updatePost(id: $id, content: $content, title: $title) {
      id
      title
      content
    }
  }
`;

export const TOGGLE_POST_LIKE = gql`
  mutation TogglePostLike($postId: String!) {
    togglePostLike(postId: $postId)
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($postId: String!, $content: String!, $parentId: String) {
    createComment(postId: $postId, content: $content, parentId: $parentId) {
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
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: String!) {
    deleteComment(id: $id)
  }
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: String!, $content: String!) {
    updateComment(id: $id, content: $content) {
      id
      content
    }
  }
`;

export const TOGGLE_COMMENT_LIKE = gql`
  mutation ToggleCommentLike($commentId: String!) {
    toggleCommentLike(commentId: $commentId)
  }
`;
