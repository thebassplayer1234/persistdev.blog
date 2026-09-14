import type { Post } from "@/src/content/generated";
import { compareDesc, parseISO } from "date-fns";
import { slug } from "github-slugger";

/**
 * Returns whether a post is eligible for a public listing, search result, or page.
 */
export const isPublicPost = (post: Post, now = new Date()): boolean => {
  return post.isPublished && parseISO(post.publishedAt) <= now;
};

export const sortPosts = (posts: Post[]) => {
  const now = new Date();
  return posts
    .slice()
    .filter((post) => isPublicPost(post, now))
    .sort((a: Post, b: Post) =>
      compareDesc(parseISO(a.publishedAt), parseISO(b.publishedAt)),
    );
};

export const numberOfPosts = (posts: Post[]): number => {
  const now = new Date();
  return posts.filter((post) => isPublicPost(post, now)).length;
};

/**
 * Returns published posts that share tags with the current post, ordered by
 * relevance and then publication date.
 */
export const getRelatedPosts = (
  currentPost: Post,
  posts: Post[],
  limit = 3,
): Post[] => {
  const currentTags = new Set(currentPost.tags?.map((tag) => slug(tag)));

  if (currentTags.size === 0 || limit <= 0) {
    return [];
  }

  const now = new Date();

  return posts
    .filter((post) => {
      if (post._id === currentPost._id || !isPublicPost(post, now)) {
        return false;
      }

      return true;
    })
    .map((post) => {
      const postTags = new Set(post.tags?.map((tag) => slug(tag)));
      const sharedTagCount = [...postTags].filter((tag) =>
        currentTags.has(tag),
      ).length;

      return { post, sharedTagCount };
    })
    .filter(({ sharedTagCount }) => sharedTagCount > 0)
    .sort(
      (a, b) =>
        b.sharedTagCount - a.sharedTagCount ||
        compareDesc(parseISO(a.post.publishedAt), parseISO(b.post.publishedAt)),
    )
    .slice(0, limit)
    .map(({ post }) => post);
};
