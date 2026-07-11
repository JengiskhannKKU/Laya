import type { MetadataRoute } from "next";
import { fetchLiveProducts } from "@/lib/live-products";
import { fetchCommunities } from "@/lib/communities";
import { absoluteUrl } from "@/lib/seo";

const staticRoutes = [
  "",
  "/search",
  "/category",
  "/community",
  "/services",
  "/services/tailor",
  "/services/weave",
  "/custom",
  "/design-clothes",
  "/weaving-order",
  "/community/heritage",
  "/passports",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries = staticRoutes.map((route) => ({
    url: absoluteUrl(route || "/"),
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  })) satisfies MetadataRoute.Sitemap;

  const [products, communities] = await Promise.all([
    fetchLiveProducts().catch(() => []),
    fetchCommunities().catch(() => []),
  ]);

  const productEntries = products.map((product) => ({
    url: absoluteUrl(`/product/${product.id}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  })) satisfies MetadataRoute.Sitemap;

  const communityEntries = communities.map((community) => ({
    url: absoluteUrl(`/community/${community.id}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  })) satisfies MetadataRoute.Sitemap;

  return [...staticEntries, ...productEntries, ...communityEntries];
}
