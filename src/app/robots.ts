import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/checkout/resultado/"],
      },
    ],
    sitemap: "https://prophone-medellin.vercel.app/sitemap.xml",
  };
}
