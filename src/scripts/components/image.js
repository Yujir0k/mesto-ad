const fallbackImage = new URL(
  "../../images/fallback-cat.jpg",
  import.meta.url
).href;
const blockedImageHosts = new Set([
  "link.ru",
  "png.pngtree.com",
  "static.vecteezy.com",
  "yandex.ru",
]);

export const getSafeImageSrc = (link) => {
  try {
    const url = new URL(link);

    if (
      !["http:", "https:"].includes(url.protocol) ||
      blockedImageHosts.has(url.hostname)
    ) {
      return fallbackImage;
    }

    return url.href;
  } catch {
    return fallbackImage;
  }
};
