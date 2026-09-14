import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import readingTime, { type ReadTimeResults } from "reading-time";
import GithubSlugger, { slug } from "github-slugger";
import sharp from "sharp";
import { isPublicPost } from "@/src/utils/Post";

const CONTENT_DIR = path.join(process.cwd(), "content");
const PUBLIC_DIR = path.join(process.cwd(), "public");
let allPostsPromise: Promise<Post[]> | undefined;
let postsBySlugPromise: Promise<Map<string, Post>> | undefined;
let categorySlugsPromise: Promise<string[]> | undefined;

type PostFrontmatter = {
  title: string;
  publishedAt: string;
  updatedAt?: string;
  description: string;
  image?: string;
  isPublished?: boolean;
  author: string;
  tags?: string[];
};

export type Heading = {
  level: "one" | "two" | "three";
  text: string;
  slug: string;
};

export type PostImage = {
  filePath: string;
  relativeFilePath: string;
  format?: string;
  height?: number;
  width?: number;
  aspectRatio?: number;
  blurhashDataUrl?: string;
};

export type Post = {
  _id: string;
  _raw: {
    sourceFilePath: string;
    sourceFileName: string;
    sourceFileDir: string;
    contentType: "mdx";
    flattenedPath: string;
  };
  type: "Post";
  title: string;
  publishedAt: string;
  updatedAt: string;
  description: string;
  image?: PostImage;
  isPublished: boolean;
  author: string;
  tags?: string[];
  body: {
    raw: string;
  };
  url: string;
  readingTime: ReadTimeResults;
  toc: Heading[];
  content: string;
};

function normalizePath(value: string) {
  return value.split(path.sep).join("/");
}

async function findMdxFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return findMdxFiles(absolutePath);
      }

      if (entry.isFile() && absolutePath.endsWith(".mdx")) {
        return [absolutePath];
      }

      return [];
    }),
  );

  return files.flat().sort();
}

function getFlattenedPath(relativePath: string) {
  const normalized = normalizePath(relativePath);
  if (normalized.endsWith("/index.mdx")) {
    return normalized.slice(0, -"/index.mdx".length);
  }

  return normalized.replace(/\.mdx$/, "");
}

function extractToc(content: string): Heading[] {
  const headingRegex = /\n(?<flag>#{1,6})\s+(?<content>.+)/g;
  const localSlugger = new GithubSlugger();

  return Array.from(content.matchAll(headingRegex)).map(({ groups }) => {
    const flag = groups?.flag ?? "";
    const headingContent = groups?.content ?? "";

    return {
      level: flag.length === 1 ? "one" : flag.length === 2 ? "two" : "three",
      text: headingContent,
      slug: headingContent ? localSlugger.slug(headingContent) : "",
    };
  });
}

async function getImageData(
  imagePath: string | undefined,
  fileDirectory: string,
): Promise<PostImage | undefined> {
  if (!imagePath) {
    return undefined;
  }

  const absoluteImagePath = path.resolve(fileDirectory, imagePath);
  const relativeToPublic = path.relative(PUBLIC_DIR, absoluteImagePath);

  if (relativeToPublic.startsWith("..")) {
    return undefined;
  }

  const metadata = await sharp(absoluteImagePath).metadata();
  const blurBuffer = await sharp(absoluteImagePath)
    .resize(8)
    .jpeg({ quality: 60 })
    .toBuffer();

  return {
    filePath: `../public/${normalizePath(relativeToPublic)}`,
    relativeFilePath: imagePath,
    format: metadata.format,
    height: metadata.height,
    width: metadata.width,
    aspectRatio:
      metadata.width && metadata.height
        ? metadata.width / metadata.height
        : undefined,
    blurhashDataUrl: `data:image/jpeg;base64,${blurBuffer.toString("base64")}`,
  };
}

async function readPostFromFile(filePath: string): Promise<Post> {
  const source = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(source);
  const frontmatter = data as PostFrontmatter;
  const relativePath = path.relative(CONTENT_DIR, filePath);
  const flattenedPath = getFlattenedPath(relativePath);
  const publishedAt = new Date(frontmatter.publishedAt).toISOString();
  const updatedAt = new Date(
    frontmatter.updatedAt ?? frontmatter.publishedAt,
  ).toISOString();
  const image = await getImageData(frontmatter.image, path.dirname(filePath));

  return {
    _id: normalizePath(relativePath).replaceAll("/", "__"),
    _raw: {
      sourceFilePath: normalizePath(path.relative(process.cwd(), filePath)),
      sourceFileName: path.basename(filePath),
      sourceFileDir: normalizePath(
        path.dirname(path.relative(process.cwd(), filePath)),
      ),
      contentType: "mdx",
      flattenedPath,
    },
    type: "Post",
    title: frontmatter.title,
    publishedAt,
    updatedAt,
    description: frontmatter.description,
    image,
    isPublished: frontmatter.isPublished ?? true,
    author: frontmatter.author,
    tags: frontmatter.tags ?? [],
    body: {
      raw: content,
    },
    url: `/post/${flattenedPath}`,
    readingTime: readingTime(content),
    toc: extractToc(content),
    content,
  };
}

export const getAllPosts = cache(async (): Promise<Post[]> => {
  allPostsPromise ??= findMdxFiles(CONTENT_DIR).then((files) =>
    Promise.all(files.map((filePath) => readPostFromFile(filePath))),
  );

  return allPostsPromise;
});

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  postsBySlugPromise ??= getAllPosts().then((posts) => {
    return new Map(posts.map((post) => [post._raw.flattenedPath, post]));
  });

  const postsBySlug = await postsBySlugPromise;
  return postsBySlug.get(slug) ?? null;
});

export const getCategorySlugs = cache(async (): Promise<string[]> => {
  categorySlugsPromise ??= getAllPosts().then((posts) => {
    const categories = new Set<string>(["all"]);

    posts.forEach((post) => {
      if (!isPublicPost(post)) {
        return;
      }

      post.tags?.forEach((tag) => {
        categories.add(slug(tag));
      });
    });

    return [...categories];
  });

  return categorySlugsPromise;
});
