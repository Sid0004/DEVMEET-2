export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/workspace/",
          "/onboarding/",
          "/api/",
        ],
      },
    ],
    sitemap: "https://devmeet-2.vercel.app/sitemap.xml",
  };
}
