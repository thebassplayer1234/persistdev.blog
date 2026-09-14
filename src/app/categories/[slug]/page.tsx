import { getAllPosts, getCategorySlugs } from "@/src/content/generated";
import PostLayoutThree from "@/src/components/Post/PostLayoutThree";
import Categories from "@/src/components/Post/Categories";
import GithubSlugger, { slug } from "github-slugger";
import { Metadata } from "next";
import { isPublicPost } from "@/src/utils/Post";

type CategoryPageParams = {
  params: Promise<{
    slug: string;
  }>;
};

const slugger = new GithubSlugger();

export async function generateStaticParams() {
  const categories = await getCategorySlugs();
  return categories.map((category) => ({ slug: category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | void> {
  const { slug } = await params;
  return {
    title: `${slug.replaceAll("-", " ")} Blog Posts`,
    description: `Learn more about ${
      slug === "all" ? "Web development" : slug
    } from our blog`,
  };
}

const CategoryPage = async ({ params }: CategoryPageParams) => {
  const { slug: currentSlug } = await params;
  const allPosts = await getAllPosts();
  const allCategories = ["all"];
  const posts = allPosts
    .filter((post) => isPublicPost(post))
    .filter((post) => {
      return post.tags?.some((tag) => {
        const slugified = slug(tag);
        if (!allCategories.includes(slugified)) {
          allCategories.push(slugified);
        }
        if (currentSlug === "all") {
          return true;
        }
        return slugified === currentSlug;
      });
    })
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      return dateB.getTime() - dateA.getTime();
    });
  return (
    <article className="mt-2 flex flex-col text-dark dark:text-light lg:mt-12">
      <div className=" flex flex-col px-5 sm:px-10 md:px-24 sxl:px-32">
        <h1 className="mt-6 text-2xl font-semibold md:text-4xl lg:text-5xl">
          #{currentSlug}
        </h1>
        <span className="mt-2 inline-block">
          Discover more categories and expand your knowledge!
        </span>
      </div>
      <Categories categories={allCategories} currentSlug={currentSlug} />
      <div className="mt-10 grid grid-cols-1 gap-8 px-8 sm:grid-cols-2 sm:gap-10 sm:px-24 lg:mt-24 lg:grid-cols-3 lg:gap-16 lg:px-32">
        {posts.map((post, index) => {
          return (
            <article className="relative col-span-1 row-span-1" key={index}>
              <PostLayoutThree post={post} />
            </article>
          );
        })}
      </div>
    </article>
  );
};

export default CategoryPage;
