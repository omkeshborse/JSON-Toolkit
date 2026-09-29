const rawSiteUrl =
  (typeof process !== 'undefined' && process.env?.VITE_SITE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SITE_URL) ||
  'https://101jsontoolkit.netlify.app';

export const SITE_URL = rawSiteUrl.replace(/\/+$/, '');

export const SITE_NAME = '101 JSON Toolkit';

export const OG_IMAGE = `${SITE_URL}/og-image.png`;
