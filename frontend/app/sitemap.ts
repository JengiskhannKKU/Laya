import type { MetadataRoute } from "next";
import { products, communities } from "@/lib/mock-data";
import { absoluteUrl } from "@/lib/seo";

const staticRoutes = [
  "",
  "/search",
  "/community",
  "/services",
  "/services/tailor",
  "/custom",
  "/design-clothes",
  "/gen-silk",
  "/weaving-order",
  "/map",
  "/passports",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = staticRoutes.map((route) => ({
    url: absoluteUrl(route || "/"),
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  })) satisfies MetadataRoute.Sitemap;

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
