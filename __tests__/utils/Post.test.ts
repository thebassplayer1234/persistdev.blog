import type { Post } from "@/src/content/generated";
import {
  getRelatedPosts,
  isPublicPost,
  numberOfPosts,
  sortPosts,
} from "@/src/utils/Post";

const createPost = (
  id: string,
  tags: string[] | undefined,
  publishedAt: string,
  overrides: Partial<Post> = {},
): Post => ({
  _id: id,
  _raw: {
    sourceFilePath: `content/${id}/index.mdx`,
    sourceFileName: "index.mdx",
    sourceFileDir: `content/${id}`,
    contentType: "mdx",
    flattenedPath: id,
  },
  type: "Post",
  title: id,
  publishedAt,
  updatedAt: publishedAt,
  description: `${id} description`,
  isPublished: true,
  author: "Test Author",
  tags,
  body: { raw: "" },
  url: `/post/${id}`,
  readingTime: { text: "1 min read", time: 60000, words: 100, minutes: 1 },
  toc: [],
  content: "",
  ...overrides,
});

describe("getRelatedPosts", () => {
  it("ranks posts by shared tag count, then by newest publication date", () => {
    const currentPost = createPost(
      "current",
      ["TypeScript", "React"],
      "2024-01-01T00:00:00Z",
    );
    const newestSingleMatch = createPost(
      "newest-single",
      ["react"],
      "2024-08-01T00:00:00Z",
    );
    const olderSingleMatch = createPost(
      "older-single",
      ["TypeScript"],
      "2024-07-01T00:00:00Z",
    );
    const strongestMatch = createPost(
      "strongest",
      ["typescript", "React", "React"],
      "2024-06-01T00:00:00Z",
    );

    const relatedPosts = getRelatedPosts(currentPost, [
      currentPost,
      olderSingleMatch,
      strongestMatch,
      newestSingleMatch,
    ]);

    expect(relatedPosts.map((post) => post._id)).toEqual([
      "strongest",
      "newest-single",
      "older-single",
    ]);
  });

  it("limits results and excludes ineligible candidates without mutating the source", () => {
    const currentPost = createPost(
      "current",
      ["TypeScript"],
      "2024-01-01T00:00:00Z",
    );
    const first = createPost("first", ["TypeScript"], "2024-08-01T00:00:00Z");
    const second = createPost("second", ["TypeScript"], "2024-07-01T00:00:00Z");
    const third = createPost("third", ["TypeScript"], "2024-06-01T00:00:00Z");
    const fourth = createPost("fourth", ["TypeScript"], "2024-05-01T00:00:00Z");
    const unpublished = createPost(
      "unpublished",
      ["TypeScript"],
      "2024-08-15T00:00:00Z",
      { isPublished: false },
    );
    const future = createPost("future", ["TypeScript"], "9999-10-01T00:00:00Z");
    const unrelated = createPost(
      "unrelated",
      ["JavaScript"],
      "2024-09-01T00:00:00Z",
    );
    const posts = [
      currentPost,
      fourth,
      unpublished,
      future,
      unrelated,
      third,
      second,
      first,
    ];
    const originalOrder = posts.map((post) => post._id);

    const relatedPosts = getRelatedPosts(currentPost, posts);

    expect(relatedPosts.map((post) => post._id)).toEqual([
      "first",
      "second",
      "third",
    ]);
    expect(posts.map((post) => post._id)).toEqual(originalOrder);
  });

  it("returns no posts when the current post has no tags", () => {
    const currentPost = createPost(
      "current",
      undefined,
      "2024-01-01T00:00:00Z",
    );
    const candidate = createPost(
      "candidate",
      ["TypeScript"],
      "2024-08-01T00:00:00Z",
    );

    expect(getRelatedPosts(currentPost, [currentPost, candidate])).toEqual([]);
  });
});

describe("public post visibility", () => {
  it("excludes unpublished and future posts from public listings", () => {
    const visible = createPost(
      "visible",
      ["TypeScript"],
      "2024-01-01T00:00:00Z",
    );
    const unpublished = createPost(
      "unpublished",
      ["TypeScript"],
      "2024-01-02T00:00:00Z",
      { isPublished: false },
    );
    const future = createPost(
      "future",
      ["TypeScript"],
      "9999-01-03T00:00:00Z",
    );
    const now = new Date("2024-01-02T12:00:00Z");
    const posts = [visible, unpublished, future];

    expect(isPublicPost(visible, now)).toBe(true);
    expect(isPublicPost(unpublished, now)).toBe(false);
    expect(isPublicPost(future, now)).toBe(false);
    expect(numberOfPosts(posts)).toBe(1);
    expect(sortPosts(posts).map((post) => post._id)).toEqual(["visible"]);
  });
});
