import { gql } from "@apollo/client";

export const CREATE_POST = gql`
  mutation CreatePost(
    $title: String!
    $content: String!
    $mediaB64: [String!]
    $scheduledFor: String
    $pollQuestion: String
    $pollOptions: [String!]
    $pollIsMultipleChoice: Boolean
  ) {
    createPost(
      title: $title
      content: $content
      mediaB64: $mediaB64
      scheduledFor: $scheduledFor
      pollQuestion: $pollQuestion
      pollOptions: $pollOptions
      pollIsMultipleChoice: $pollIsMultipleChoice
    ) {
      id
      title
      content
      mediaUrls
      likesCount
      commentsCount
      viewsCount
      scheduledFor
      isScheduled
      createdAt
      hasLiked
      poll {
        id
        question
        isMultipleChoice
        totalVotes
        hasVoted
        userVotedOptionId
        userVotedOptionIds
        options {
          id
          text
          votesCount
          percentage
        }
      }
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

export const VOTE_POLL = gql`
  mutation VotePoll($pollId: String!, $optionId: String!) {
    votePoll(pollId: $pollId, optionId: $optionId) {
      id
      question
      isMultipleChoice
      totalVotes
      hasVoted
      userVotedOptionId
      userVotedOptionIds
      options {
        id
        text
        votesCount
        percentage
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
  mutation UpdatePost($id: String!, $content: String!, $title: String, $mediaUrls: [String!]) {
    updatePost(id: $id, content: $content, title: $title, mediaUrls: $mediaUrls) {
      id
      title
      content
      mediaUrls
    }
  }
`;

export const TOGGLE_POST_LIKE = gql`
  mutation TogglePostLike($postId: String!) {
    togglePostLike(postId: $postId)
  }
`;

export const VIEW_POST = gql`
  mutation ViewPost($postId: String!) {
    viewPost(postId: $postId)
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($postId: String!, $content: String!, $parentId: String) {
    createComment(postId: $postId, content: $content, parentId: $parentId) {
      id
      content
      likesCount
      isPinned
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

export const TOGGLE_PIN_COMMENT = gql`
  mutation TogglePinComment($commentId: String!) {
    togglePinComment(commentId: $commentId)
  }
`;

export const REPORT_POST = gql`
  mutation ReportPost($postId: String!, $reason: String!) {
    reportPost(postId: $postId, reason: $reason)
  }
`;

export const REPORT_COMMENT = gql`
  mutation ReportComment($commentId: String!, $reason: String!) {
    reportComment(commentId: $commentId, reason: $reason)
  }
`;

