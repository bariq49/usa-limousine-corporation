function normalizeUrl(raw: string): string {
    return raw.trim().replace(/\/+$/, "");
}

/** Backend API root including the version prefix, e.g. https://api.usalimocorp.com/api/v1 */
export function getApiBaseUrl(): string {
    const fromEnv = normalizeUrl(process.env.NEXT_PUBLIC_API_BASE_URL || "");

    if (!fromEnv) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
    }

    return fromEnv;
}
