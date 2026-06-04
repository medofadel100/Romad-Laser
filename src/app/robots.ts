import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/*?*", // query strings
          "/ar/account/",
          "/en/account/",
          "/ar/checkout/",
          "/en/checkout/",
          "/ar/cart/",
          "/en/cart/",
        ],
      },
    ],
    sitemap: "https://romalaser.com/sitemap.xml",
    host: "https://romalaser.com",
  };
}
