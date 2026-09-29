import { getRouteHead } from './routeHead';

/**
 * Updates browser document head dynamically during client-side SPA navigation.
 */
export function applyRouteHead(pathname: string): void {
  if (typeof document === 'undefined') return;

  const head = getRouteHead(pathname);

  // 1. Title
  document.title = head.title;

  // 2. Meta description
  let descMeta = document.querySelector('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement('meta');
    descMeta.setAttribute('name', 'description');
    document.head.appendChild(descMeta);
  }
  descMeta.setAttribute('content', head.description);

  // 3. Robots meta
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = document.createElement('meta');
    robotsMeta.setAttribute('name', 'robots');
    document.head.appendChild(robotsMeta);
  }
  robotsMeta.setAttribute('content', head.robots);

  // 4. Canonical link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (head.canonical) {
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', head.canonical);
  } else if (canonicalLink) {
    canonicalLink.remove();
  }

  // 5. OpenGraph Tags
  const ogTags: Record<string, string> = {
    'og:type': head.ogType,
    'og:title': head.ogTitle,
    'og:description': head.ogDescription,
    'og:url': head.ogUrl,
    'og:image': head.ogImage,
    'og:site_name': '101 JSON Toolkit',
  };

  for (const [property, content] of Object.entries(ogTags)) {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  // 6. Twitter Card Tags
  const twitterTags: Record<string, string> = {
    'twitter:card': head.twitterCard,
    'twitter:title': head.twitterTitle,
    'twitter:description': head.twitterDescription,
    'twitter:image': head.twitterImage,
  };

  for (const [name, content] of Object.entries(twitterTags)) {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  // 7. JSON-LD structured data
  let schemaScript = document.getElementById('schema-ld-json') as HTMLScriptElement | null;
  if (head.jsonLd) {
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'schema-ld-json';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(head.jsonLd);
  } else if (schemaScript) {
    schemaScript.remove();
  }
}
