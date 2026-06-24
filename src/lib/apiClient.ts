const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  // Nếu chưa cấu hình URL API của n8n, tự động trả về lỗi để giao diện kích hoạt cơ chế dự phòng dữ liệu mẫu
  if (!BASE_URL) {
    return { 
      success: false, 
      error: "N8N API URL is not configured. Using local mock data." 
    };
  }

  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers = new Headers(options.headers);

    headers.set("Content-Type", "application/json");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Đảm bảo không bị lặp dấu gạch chéo chéo "/" giữa base URL và endpoint
    const url = BASE_URL.endsWith("/") && endpoint.startsWith("/")
      ? `${BASE_URL}${endpoint.slice(1)}`
      : !BASE_URL.endsWith("/") && !endpoint.startsWith("/")
      ? `${BASE_URL}/${endpoint}`
      : `${BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.message || errorJson.error || errorMsg;
      } catch {
        if (errorText) errorMsg = errorText;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`[apiFetch] API call to /${endpoint} failed. Fallback triggered. Reason:`, errorMsg);
    return { 
      success: false, 
      error: errorMsg || "Không thể kết nối đến backend." 
    };
  }
}
