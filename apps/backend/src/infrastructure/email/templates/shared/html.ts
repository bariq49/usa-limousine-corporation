export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function emailAssetsUrl(cloudName = process.env["CLOUDINARY_CLOUD_NAME"]?.trim()) {
  if (!cloudName) {
    throw new Error("CLOUDINARY_CLOUD_NAME is required for email assets");
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/usa-limousine/email`;
}

export function emailLogoUrl(assetsUrl = emailAssetsUrl()) {
  return `${assetsUrl.replace("/image/upload/", "/image/upload/w_440/")}/white-logo.png`;
}

export function emailSiteUrl(siteUrl = process.env["WEBSITE_URL"]?.trim()) {
  return (siteUrl ?? "").replace(/\/+$/, "");
}
