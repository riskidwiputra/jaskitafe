import { connection } from "next/server";
import HomeLanding from "@/components/HomeLanding";

async function getInstagramPosts() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) {
    return { posts: [], status: "not_configured" };
  }

  const apiVersion = process.env.INSTAGRAM_GRAPH_API_VERSION || "v22.0";
  if (!/^v\d+\.\d+$/.test(apiVersion)) {
    console.error("INSTAGRAM_GRAPH_API_VERSION must use the format vNN.0");
    return { posts: [], status: "unavailable" };
  }

  const url = new URL(
    `https://graph.instagram.com/${apiVersion}/me/media`,
  );
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
      const errorBody = await response.json().catch(() => null);
      console.error("Instagram media request failed:", {
        status: response.status,
        message: errorBody?.error?.message || "Meta API returned an error",
        code: errorBody?.error?.code,
        type: errorBody?.error?.type,
      });
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

    return {
      posts,
      status: posts.length > 0 ? "connected" : "empty",
    };
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
