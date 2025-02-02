import styles from "./styles.module.scss";
import { getPrismicClient } from "../../services/prismic";
import { RichText } from "prismic-dom";
import { Session } from "next-auth";
import { useSession } from "next-auth/client";
import Prismic from "@prismicio/client";
import Head from "next/head";
import { GetStaticProps } from "next";
import Link from "next/link";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
};

interface PostsProps {
  posts: Post[];
}
interface UserSubscriptionSession extends Session {
  activeSubscription?: any;
}

type SessionProps = [UserSubscriptionSession, boolean];

export default function Posts({ posts }: PostsProps) {
  const [session]: SessionProps = useSession();

  return (
    <>
      <Head>
        <title>Posts | TechNews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post =>
            session?.activeSubscription ? (
              <Link href={`/posts/${post.slug}`}>
                <a
                  key={post.slug}
                  href="https://howow.linebr.com/minhaconta.php"
                >
                  <time>{post.updatedAt}</time>

                  <strong>{post.title}</strong>
                  <p>{post.excerpt}</p>
                </a>
              </Link>
            ) : (
              <Link href={`/posts/preview/${post.slug}`}>
                <a
                  key={post.slug}
                  href="https://howow.linebr.com/minhaconta.php"
                >
                  <time>{post.updatedAt}</time>

                  <strong>{post.title}</strong>
                  <p>{post.excerpt}</p>
                </a>
              </Link>
            )
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at("document.type", "post")],
    {
      fetch: ["publication.title", "publication.content"],
      pageSize: 100,
    }
  );

  const posts = response.results.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt:
        post.data.content.find(content => content.type === "paragraph")?.text ?? // se não existir isso retorna isso
        "",
      updatedAt: new Date(post.last_publication_date).toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),
    };
  });

  return {
    props: {
      posts,
    },
  };
};
