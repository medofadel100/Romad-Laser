// ─── Cloudinary Upload ───────────────────────────────────────────────────────

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export async function uploadMultipleToCloudinary(
  files: File[],
  folder = "roma-products"
): Promise<CloudinaryUploadResult[]> {
  if (files.length > 15) {
    throw new Error("Maximum 15 images allowed per product");
  }

  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  formData.append("folder", folder);

  const response = await fetch("/api/cloudinary/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}
): string {
  if (!CLOUD_NAME) return "";

  const { width, height, quality = "auto", format = "auto" } = options;

  const transforms: string[] = [
    `q_${quality}`,
    `f_${format}`,
  ];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push("c_fill");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/v1/${publicId}`;
}

/**
 * Delete image from Cloudinary (requires server-side, just returns publicId for now)
 */
export function extractPublicId(cloudinaryUrl: string): string {
  // Extract public_id from full URL
  const parts = cloudinaryUrl.split("/upload/");
  if (parts.length < 2) return "";
  const withoutVersion = parts[1].replace(/^v\d+\//, "");
  return withoutVersion.replace(/\.[^/.]+$/, "");
}
