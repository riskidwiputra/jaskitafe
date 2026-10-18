const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function getReviewPhotoUrl(photoUrl) {
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
  return `${API_BASE_URL?.replace(/\/api\/?$/, "")}${photoUrl}`;
}
