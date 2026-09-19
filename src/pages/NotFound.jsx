import { Link } from "react-router-dom";
import Icon from "../components/Icon";

export default function NotFound() {
  return (
    <section className="section" style={{ paddingTop: "calc(var(--header-h) + 90px)" }}>
      <div className="container" style={{ textAlign: "center", maxWidth: 560 }}>
        <span className="eyebrow eyebrow-plain" style={{ justifyContent: "center" }}>
          Error 404
        </span>
        <h1>Page not found</h1>
        <p className="lede" style={{ margin: "0 auto 32px" }}>
          The page you were looking for doesn&rsquo;t exist or has moved.
        </p>
        <Link to="/" className="btn">
          Back to home
          <Icon name="arrowRight" size={18} />
        </Link>
      </div>
    </section>
  );
}
