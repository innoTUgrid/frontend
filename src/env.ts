import { environment } from "@env/environment";

const fetchApiUrl = async () => {
  try {
    const meta = await fetch("meta.json").then(r => r.json())
    if (meta?.apiUrl) {
        return meta.apiUrl;
    }
  } catch (e) {
    console.error("failed to fetch api url from api.json", e);
  }
}

export const injectApiUrl = async () => {
  const apiUrl = await fetchApiUrl();
  if (apiUrl) {
    // override the apiUrl from environment.ts
    environment.apiUrl = apiUrl;
    console.log("apiUrl dynamically set to", environment.apiUrl);
  }
  return apiUrl;
};