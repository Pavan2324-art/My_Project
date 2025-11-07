export const BASEURL = "http://localhost:5000/api";

export async function callApi(reqMethod, endpoint, data = null, token = null) {
  try {
    const options = {
      method: reqMethod,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    if (reqMethod !== "GET" && reqMethod !== "DELETE" && data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASEURL}${endpoint}`, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
