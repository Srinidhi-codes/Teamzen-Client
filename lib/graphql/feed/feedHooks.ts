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
  TOGGLE_COMMENT_LIKE,
  VIEW_POST,
  REPORT_POST,
  REPORT_COMMENT,
  TOGGLE_PIN_COMMENT,
  VOTE_POLL
} from "./mutations";

export const useFeedPosts = (page = 1, pageSize = 10, authorId?: string) => {
  const { data, loading, error, refetch, fetchMore } = useQuery<any>(GET_POSTS, {
    variables: { page, pageSize, authorId },
    fetchPolicy: "cache-first",
  });

  const rawPosts: any[] = data?.posts?.results || [];
  const seenIds = new Set<string>();
  const posts = rawPosts.filter((p: any) => {
    if (!p?.id) return false;
    const strId = String(p.id);
    if (seenIds.has(strId)) return false;
    seenIds.add(strId);
    return true;
  });

  return {
    posts,
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
      if (!createPost?.id) return;
      cache.modify({
        fields: {
          posts(existingPosts = {}, { readField }) {
            const existingResults = existingPosts.results || [];
            // Remove any existing reference with this ID to guarantee uniqueness
            const filteredResults = existingResults.filter((ref: any) => {
              const id = readField ? readField('id', ref) : (ref?.id || ref?.__ref);
              return String(id) !== String(createPost.id);
            });

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
              total: filteredResults.length + 1,
              results: [newPostRef, ...filteredResults]
            };
          }
        }
      });
    }
  });

  const [deletePost, { loading: isDeletingPost }] = useMutation<any>(DELETE_POST, {
    update(cache, _, { variables }: any) {
      if (variables?.id) {
        cache.evict({ id: cache.identify({ __typename: 'PostType', id: variables.id }) });
        cache.gc();
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

  const [deleteComment] = useMutation<any>(DELETE_COMMENT, {
    update(cache, _, { variables }: any) {
      if (variables?.id) {
        cache.evict({ id: cache.identify({ __typename: 'CommentType', id: variables.id }) });
        cache.gc();
      }
    }
  });

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

  const [updatePost] = useMutation<any>(UPDATE_POST, {
    update(cache, _, { variables }: any) {
      if (variables?.id) {
        cache.modify({
          id: cache.identify({ __typename: 'PostType', id: variables.id }),
          fields: {
            title() { return variables.title; },
            content() { return variables.content; },
            mediaUrls() { return variables.mediaUrls ?? []; },
            updatedAt() { return new Date().toISOString(); }
          }
        });
      }
    }
  });

  const [updateComment] = useMutation<any>(UPDATE_COMMENT, {
    update(cache, _, { variables }: any) {
      if (variables?.id) {
        cache.modify({
          id: cache.identify({ __typename: 'CommentType', id: variables.id }),
          fields: {
            content() { return variables.content; },
            updatedAt() { return new Date().toISOString(); }
          }
        });
      }
    }
  });
  const [viewPost] = useMutation<any>(VIEW_POST);
  const [reportPost] = useMutation<any>(REPORT_POST);
  const [reportComment] = useMutation<any>(REPORT_COMMENT);
  const [togglePinComment] = useMutation<any>(TOGGLE_PIN_COMMENT);
  const [votePoll, { loading: isVotingPoll }] = useMutation<any>(VOTE_POLL, {
    update(cache, { data: { votePoll } }) {
      if (!votePoll?.id) return;
      cache.modify({
        id: cache.identify({ __typename: 'PollType', id: votePoll.id }),
        fields: {
          totalVotes() { return votePoll.totalVotes; },
          hasVoted() { return votePoll.hasVoted; },
          isMultipleChoice() { return votePoll.isMultipleChoice; },
          userVotedOptionId() { return votePoll.userVotedOptionId; },
          userVotedOptionIds() { return votePoll.userVotedOptionIds; },
          options() { return votePoll.options; }
        }
      });
    }
  });

  return {
    createPost,
    isCreatingPost,
    deletePost,
    updatePost,
    viewPost,
    reportPost,
    reportComment,
    togglePinComment,
    votePoll,
    isVotingPoll,
    isDeletingPost,
    togglePostLike,
    createComment,
    isCreatingComment,
    deleteComment,
    updateComment,
    toggleCommentLike
  };
};
