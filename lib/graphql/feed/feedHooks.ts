import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { GET_POSTS, GET_POST_COMMENTS } from "./queries";
import { 
  CREATE_POST, 
  DELETE_POST, 
  UPDATE_POST,
  TOGGLE_POST_LIKE, 
  CREATE_COMMENT, 
  DELETE_COMMENT, 
  UPDATE_COMMENT,
  TOGGLE_COMMENT_LIKE 
} from "./mutations";

export const useFeedPosts = (page = 1, pageSize = 10, authorId?: string) => {
  const { data, loading, error, refetch, fetchMore } = useQuery<any>(GET_POSTS, {
    variables: { page, pageSize, authorId },
    fetchPolicy: "cache-and-network",
  });

  return {
    posts: data?.posts?.results || [],
    total: data?.posts?.total || 0,
    loading,
    error,
    refetch,
    fetchMore
  };
};

const EMPTY_COMMENTS: any[] = [];

export const usePostComments = (postId: string, skip: boolean = false) => {
  const { data, loading, error, refetch, fetchMore } = useQuery<any>(GET_POST_COMMENTS, {
    variables: { postId, limit: 5, offset: 0 },
    skip: !postId || skip,
  });

  return {
    comments: data?.post?.comments || EMPTY_COMMENTS,
    topLevelCommentsCount: data?.post?.topLevelCommentsCount || 0,
    loading,
    error,
    refetch,
    fetchMore
  };
};

export const useFeedMutations = () => {
  const [createPost, { loading: isCreatingPost }] = useMutation<any>(CREATE_POST, {
    update(cache, { data: { createPost } }) {
      cache.modify({
        fields: {
          posts(existingPosts = {}) {
            const newPostRef = cache.writeFragment({
              data: createPost,
              fragment: gql`
                fragment NewPost on PostType {
                  id
                }
              `
            });
            return {
              ...existingPosts,
              results: [newPostRef, ...(existingPosts.results || [])]
            };
          }
        }
      });
    }
  });

  const [deletePost, { loading: isDeletingPost }] = useMutation<any>(DELETE_POST, {
    update(cache, { data: { deletePost } }, { variables }: any) {
      if (deletePost) {
        cache.modify({
          fields: {
            posts(existingPosts = {}, { readField }) {
              return {
                ...existingPosts,
                results: existingPosts.results.filter(
                  (postRef: any) => readField('id', postRef) !== variables?.id
                )
              };
            }
          }
        });
      }
    }
  });

  const [togglePostLike] = useMutation<any>(TOGGLE_POST_LIKE, {
    update(cache, { data: { togglePostLike } }, { variables }: any) {
      if (variables?.postId) {
        cache.modify({
          id: cache.identify({ __typename: 'PostType', id: variables.postId }),
          fields: {
            hasLiked() {
              return togglePostLike;
            },
            likesCount(currentCount) {
              return togglePostLike ? currentCount + 1 : Math.max(0, currentCount - 1);
            }
          }
        });
      }
    }
  });

  const [createComment, { loading: isCreatingComment }] = useMutation<any>(CREATE_COMMENT);

  const [deleteComment] = useMutation<any>(DELETE_COMMENT);

  const [toggleCommentLike] = useMutation<any>(TOGGLE_COMMENT_LIKE, {
    update(cache, { data: { toggleCommentLike } }, { variables }: any) {
      if (variables?.commentId) {
        cache.modify({
          id: cache.identify({ __typename: 'CommentType', id: variables.commentId }),
          fields: {
            hasLiked() {
              return toggleCommentLike;
            },
            likesCount(currentCount) {
              return toggleCommentLike ? currentCount + 1 : Math.max(0, currentCount - 1);
            }
          }
        });
      }
    }
  });

  const [updatePost] = useMutation<any>(UPDATE_POST);
  const [updateComment] = useMutation<any>(UPDATE_COMMENT);

  return {
    createPost,
    isCreatingPost,
    deletePost,
    updatePost,
    isDeletingPost,
    togglePostLike,
    createComment,
    isCreatingComment,
    deleteComment,
    updateComment,
    toggleCommentLike
  };
};
