import { connection } from "next/server";
import HomeLanding from "@/components/HomeLanding";

async function getInstagramPosts() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) {
    return { posts: [], status: "not_configured" };
  }

  const url = new URL("https://graph.instagram.com/me/media");
  url.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp",
  );
  url.searchParams.set("limit", "6");

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      console.error("Instagram media request failed with status:", response.status);
      return { posts: [], status: "unavailable" };
    }

    const result = await response.json();
    if (!Array.isArray(result.data)) {
      console.error("Instagram media response did not include a data list");
      return { posts: [], status: "unavailable" };
    }

    const posts = result.data
      .map((post) => ({
        id: post.id,
        caption: post.caption || "",
        imageUrl:
          post.media_type === "VIDEO"
            ? post.thumbnail_url
            : post.media_url || post.thumbnail_url,
        postUrl: post.permalink,
      }))
      .filter((post) => post.id && post.imageUrl && post.postUrl);

    return { posts, status: "connected" };
  } catch (error) {
    console.error("Instagram media request failed:", error);
    return { posts: [], status: "unavailable" };
  }
}

export default async function Home() {
  await connection();
  const { posts, status } = await getInstagramPosts();

  return <HomeLanding instagramPosts={posts} instagramStatus={status} />;
}
