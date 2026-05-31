const rawApiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").trim();

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");

export const buildApiUrl = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};

type ApiRequestOptions = RequestInit & {
    body?: BodyInit | null;
};

let refreshPromise: Promise<boolean> | null = null;
let isRedirecting = false;

async function refreshAccessToken(): Promise<boolean> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const res = await fetch(buildApiUrl("/api/v1/users/refresh-token"), {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
            });
            return res.ok;
        } catch {
            return false;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const response = await fetch(buildApiUrl(path), {
        credentials: "include",
        ...options,
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            ...(options.headers || {}),
        },
    });

    const cleanPath = typeof window !== "undefined" ? window.location.pathname.replace(/\/$/, "") : "";
    const isGuestRoute = cleanPath === "/login" || cleanPath === "/signup" || cleanPath === "" || cleanPath === "/";

    if (response.status === 401 && 
        path !== "/api/v1/users/login" && 
        path !== "/api/v1/users/refresh-token" && 
        path !== "/api/v1/users/register" &&
        path !== "/api/v1/users/logout" &&
        !isGuestRoute &&
        !isRedirecting
    ) {
        const success = await refreshAccessToken();
        if (success) {
            // Retry the original request
            const retryResponse = await fetch(buildApiUrl(path), {
                credentials: "include",
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                    ...(options.headers || {}),
                },
            });
            const retryData = await retryResponse.json().catch(() => null);
            if (!retryResponse.ok) {
                throw new Error(retryData?.message || "Request failed after token refresh");
            }
            return retryData as T;
        } else {
            if (typeof window !== "undefined" && !isRedirecting) {
                isRedirecting = true;
                window.location.href = "/login";
            }
            throw new Error("Session expired. Please log in again.");
        }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || "Request failed");
    }

    isRedirecting = false;

    return data as T;
}