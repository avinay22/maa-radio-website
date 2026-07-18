import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://maaradiogogamukh.in";
    const lastModified = new Date();

    return [
        {
            url: baseUrl,
            lastModified,
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/products`,
            lastModified,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/accessories`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified,
            changeFrequency: "yearly",
            priority: 0.6,
        },
    ];
}