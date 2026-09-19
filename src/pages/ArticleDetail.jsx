import { Link, useParams } from "react-router-dom";
import PageHero from "../components/PageHero";
import Icon from "../components/Icon";
import { Loading, ErrorState } from "../components/States";
import { cms, mediaUrl } from "../lib/cms";
import { useCms } from "../hooks/useCms";
import styles from "./ArticleDetail.module.css";

const formatDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

export default function ArticleDetail() {
  const { slug } = useParams();
  const { data: post, loading, error, reload } = useCms(() => cms.post(slug), [slug]);
  const { data: more } = useCms(() => cms.posts({ type: "blog", limit: 4 }), []);

  if (loading) {
    return (
      <section className="section">
        <div className="container"><Loading rows={6} /></div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <ErrorState error={error} onRetry={reload} label="article" />
          <Link to="/news-and-media" className="link-arrow">
            <Icon name="arrowRight" size={16} style={{ transform: "rotate(180deg)" }} />
            Back to News &amp; Media
          </Link>
        </div>
      </section>
    );
  }

  const related = (more?.items || []).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHero
        title={post.title}
        crumb="News & Media"
        image={mediaUrl(post.featuredImage) || "/images/focus/books-children.jpg"}
      />

      <section className="section">
        <div className={`container ${styles.layout}`}>
          <article className={styles.body}>
            <div className={styles.meta}>
              <span>{formatDate(post.publishedAt)}</span>
              {post.author?.name && <span>&middot; {post.author.name}</span>}
              {post.tags?.map((t) => (
                <span key={t._id} className={styles.tag}>{t.name}</span>
              ))}
            </div>

            {post.excerpt && <p className={styles.lede}>{post.excerpt}</p>}

            {/* body HTML is authored in the admin editor by trusted staff */}
            <div className={styles.prose} dangerouslySetInnerHTML={{ __html: post.body }} />

            <Link to="/news-and-media" className={styles.back}>
              <Icon name="arrowRight" size={16} style={{ transform: "rotate(180deg)" }} />
              All articles
            </Link>
          </article>

          {related.length > 0 && (
            <aside className={styles.aside}>
              <h4>More articles</h4>
              <ul>
                {related.map((r) => (
                  <li key={r._id}>
                    <Link to={`/news-and-media/${r.slug}`}>
                      {r.featuredImage?.url && <img src={mediaUrl(r.featuredImage)} alt="" loading="lazy" />}
                      <span>
                        <em>{formatDate(r.publishedAt)}</em>
                        {r.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </section>
    </>
  );
}
