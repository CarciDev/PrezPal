export async function getSummary() {
  const response = await fetch("/api/summary");
  return await response.json();
}
