function normalizeUrl(raw: string): string {
    return raw.trim().replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
    const fromEnv = normalizeUrl(process.env.NEXT_PUBLIC_API_BASE_URL || "");

    if (!fromEnv) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
    }

    return fromEnv;
}

export function getAppUrl(): string {
    const fromEnv = normalizeUrl(process.env.NEXT_PUBLIC_APP_URL || "");

    if (!fromEnv) {
        throw new Error("NEXT_PUBLIC_APP_URL is not set");
    }

    return fromEnv;
}

export function getCustomerAppUrl(): string {
    const fromEnv = normalizeUrl(process.env.NEXT_PUBLIC_CUSTOMER_APP_URL || "");

    if (!fromEnv) {
        throw new Error("NEXT_PUBLIC_CUSTOMER_APP_URL is not set");
    }

    return fromEnv;
}
