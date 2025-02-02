const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

async function queryPhotos(photoQuery) {
  const UNSPLASH_QUERY_URL = "https://api.unsplash.com/search/photos";

  try {
    const response = await fetch(
      `${UNSPLASH_QUERY_URL}?client_id=${UNSPLASH_ACCESS_KEY}&query=${encodeURIComponent(
        photoQuery
      )}`
    );

    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return [];
    }

    const photoData = await response.json();
    return photoData.results.map((photo) => {
      return {
        src: photo.urls.raw,
        alt: photo.alt_description,
      };
    });
  } catch (error) {
    console.error("Request failed:", error);
    return [];
  }
}

export { queryPhotos };
