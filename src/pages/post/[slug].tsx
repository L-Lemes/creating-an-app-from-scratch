import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  last_publication_date: string | null;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const amountWords = post.data.content.reduce((acumulador, content) => {
    const words = RichText.asText(content.body).split(' ').length;

    return acumulador + words;
  }, 0);

  const readingTime = Math.ceil(amountWords / 200);

  return (
    <div className={styles.Container}>
      <Header />
      <img src={post.data.banner.url} alt="banner" />
      <article className={commonStyles.Container}>
        <h2>{post.data.title}</h2>
        <div>
          <section>
            <FiCalendar />
            <time>
              {format(new Date(post.first_publication_date), 'd MMM Y', {
                locale: ptBR,
              })}
            </time>
          </section>
          <section>
            <FiUser />
            <span>{post.data.author}</span>
          </section>
          <section>
            <FiClock />
            <span>{readingTime} min</span>
          </section>
        </div>
        {post.data.content.map(({ heading, body }) => (
          <main key={heading}>
            <h3>{heading}</h3>
            <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }} />
          </main>
        ))}
      </article>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  return {
    paths: posts.results.map(post => ({
      params: { slug: post.uid },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});

  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content,
    },
  };
  return {
    props: { post },
    redirect: 60,
  };
};
