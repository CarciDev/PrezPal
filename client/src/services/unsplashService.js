const UNSPLASH_API_KEYS = Object.entries(import.meta.env)
  .filter(([key]) => key.startsWith("VITE_UNSPLASH_ACCESS_KEY"))
  .map(([_, value]) => value)
  .filter(Boolean);

let currentKeyIndex = 0;

const keyUsage = new Map(
  UNSPLASH_API_KEYS.map((key) => [
    key,
    {
      requests: 0,
      lastUsed: 0,
      errorCount: 0,
    },
  ])
);

function getNextKey() {
  if (UNSPLASH_API_KEYS.length === 0) {
    throw new Error("No API keys configured");
  }

  const now = Date.now();

  for (let i = 0; i < UNSPLASH_API_KEYS.length; i++) {
    currentKeyIndex = (currentKeyIndex + 1) % UNSPLASH_API_KEYS.length;
    const key = UNSPLASH_API_KEYS[currentKeyIndex];
    const usage = keyUsage.get(key);

    if (now - usage.lastUsed > 60 * 60 * 1000) {
      usage.requests = 0;
      usage.errorCount = 0;
    }

    if (usage.requests < 50 && usage.errorCount < 3) {
      usage.requests++;
      usage.lastUsed = now;
      return key;
    }
  }

  throw new Error("All API keys are currently rate limited");
}

function recordError(key) {
  const usage = keyUsage.get(key);
  if (usage) {
    usage.errorCount++;
  }
}

async function queryPhotos(photoQuery) {
  const UNSPLASH_QUERY_URL = "https://api.unsplash.com/search/photos";

  try {
    const key = getNextKey();
    const response = await fetch(
      `${UNSPLASH_QUERY_URL}?client_id=${key}&query=${encodeURIComponent(
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
