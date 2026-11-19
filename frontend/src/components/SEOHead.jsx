import { useEffect } from "react";

/**
 * Minimal SEO head manager.
 * - On /admin → injects <meta name="robots" content="noindex, nofollow">
 * - On all other routes → ensures the public robots meta is set to index,follow
 *
 * Implemented without an external lib (no react-helmet) to keep bundle size tiny.
 */
const setMeta = (name, content) => {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const SEOHead = () => {
  useEffect(() => {
    const isAdmin = window.location.pathname.startsWith("/admin");
    if (isAdmin) {
      setMeta(
        "robots",
        "noindex, nofollow, noarchive, nosnippet, noimageindex"
      );
      setMeta("googlebot", "noindex, nofollow");
      document.title = "Admin · AZ Distribution";
    } else {
      setMeta(
        "robots",
        "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      );
      setMeta("googlebot", "index, follow");
    }
  }, []);

  return null;
};

export default SEOHead;
