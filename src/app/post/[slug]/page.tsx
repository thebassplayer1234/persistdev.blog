import { getAllPosts, getPostBySlug } from "@/src/content/generated";
import { getRelatedPosts, isPublicPost } from "@/src/utils/Post";
import PostDetails from "@/src/components/Post/PostDetails";
import RelatedPosts from "@/src/components/Post/RelatedPosts";
import RenderMdx from "@/src/components/Post/RenderMdx";
import ButtonTag from "@/src/components/Elements/ButtonTag";
import { slug } from "github-slugger";
import Image from "next/image";
import TableOfContent from "@/src/components/Post/TableOfContent";
import { siteMetadata } from "@/src/utils/siteMetadata";
import NotFound from "./not-found";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import parseDate from "@/src/utils/dateParser";

export async function generateStaticParams() {
  const allPosts = await getAllPosts();
  return allPosts
    .filter((post) => isPublicPost(post))
    .map((post) => ({ slug: post._raw.flattenedPath }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | void> {
  const { slug: postSlug } = await params;
  const post = await getPostBySlug(postSlug);
  if (!post || !isPublicPost(post)) {
    notFound();
  }

  const publishedAt = parseDate(post.publishedAt);
  const modifiedAt = parseDate(post.updatedAt || post.publishedAt);

  if (!publishedAt || !modifiedAt) {
    notFound();
  }

  let blogMainImageList: string[] = [siteMetadata.socialBanner];
  if (post.image && typeof post.image.filePath === "string") {
    blogMainImageList = [
      siteMetadata.siteUrl + post.image.filePath.replace("../public", ""),
    ];
  }

  const ogImages = blogMainImageList.map((image) => {
    return {
      url: image.includes("http") ? image : siteMetadata.siteUrl + image,
    };
  });
  const authors = post?.author ? [post.author] : siteMetadata.author;

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: siteMetadata.siteUrl + post.url,
      siteName: siteMetadata.title,
      images: ogImages,
      locale: siteMetadata.locale,
      type: "article",
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      authors: authors.length > 0 ? authors : siteMetadata.author,
    },
    twitter: {
      card: "summary_large_image",
      title: siteMetadata.title,
      description: siteMetadata.description,
      creator: siteMetadata.author,
      images: ogImages,
    },
  };
}

const PostPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug: postSlug } = await params;
  const post = await getPostBySlug(postSlug);
  if (!post || !isPublicPost(post)) {
    return <NotFound />;
  }
  const firstPostTag = post?.tags?.[0];

  const datePublished = parseDate(post?.publishedAt);
  const dateModified = parseDate(post?.updatedAt || post?.publishedAt);

  if (!datePublished || !dateModified) {
    return <NotFound />;
  }

  const author = post?.author ? [post?.author] : siteMetadata.author;

  let postMainImageList: string[] = [siteMetadata.socialBanner];
  if (post?.image && typeof post.image.filePath === "string") {
    postMainImageList = [
      siteMetadata.siteUrl + post.image.filePath.replace("../public", ""),
    ];
  }

  const postImage = post?.image?.filePath.replace("../public", "") ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post?.title,
    description: post?.description,
    image: postMainImageList,
    datePublished: datePublished,
    dateModified: dateModified,
    author: [
      {
        "@type": "Person",
        name: author,
        url: process.env.NEXT_PUBLIC_SITE_URL,
      },
    ],
  };

  const relatedPosts = getRelatedPosts(post, await getAllPosts());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <div className="bg-dark relative mb-8 h-[30vh] w-full text-center">
          <div className="absolute top-1/2 left-1/2 z-10 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
            {firstPostTag ? (
              <ButtonTag
                name={firstPostTag}
                link={`/categories/${slug(firstPostTag)}`}
                className="px-6 py-2 text-sm"
              />
            ) : null}
            <h1 className="text-light relative mt-6 inline-block w-5/6 text-2xl leading-normal font-semibold normal-case md:text-3xl lg:text-5xl">
              {post?.title}
            </h1>
          </div>
          <div className="bg-dark/60 dark:bg-dark/40 absolute top-0 right-0 bottom-0 left-0 h-full" />
          {post?.image ? (
            <Image
              src={postImage}
              alt={post.title}
              placeholder="blur"
              blurDataURL={post.image?.blurhashDataUrl}
              height={post.image?.height}
              width={post.image?.width}
              className="aspect-square h-full w-full object-cover object-center"
            />
          ) : null}
        </div>
        {post ? <PostDetails post={post} slug={postSlug} /> : null}
        <div className="sxl:gap-16 mt-8 grid grid-cols-12 gap-y-8 px-5 md:px-10 lg:gap-8">
          <div className="col-span-12 lg:col-span-2">
            <TableOfContent post={post} />
          </div>
          {post ? <RenderMdx source={post.body.raw} /> : null}
        </div>
        <RelatedPosts posts={relatedPosts} />
      </article>
    </>
  );
};

export default PostPage;
