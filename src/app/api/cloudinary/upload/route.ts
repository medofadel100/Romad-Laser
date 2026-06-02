import { NextResponse } from "next/server";
import { createHash } from "crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

function getCloudinaryUploadUrl(cloudName: string) {
  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
}

function createSignature(folder: string, timestamp: number) {
  const signatureString = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
  return createHash("sha1").update(signatureString).digest("hex");
}

async function uploadFile(file: File, folder: string): Promise<CloudinaryUploadResult> {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createSignature(folder, timestamp);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", API_KEY!);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);
  formData.append("quality", "auto");
  formData.append("fetch_format", "auto");

  const response = await fetch(getCloudinaryUploadUrl(CLOUD_NAME!), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  };
}

export async function POST(request: Request) {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return NextResponse.json(
      { error: "Cloudinary server configuration is missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const folder = (formData.get("folder")?.toString() || "romad-products").trim();
  const images = formData.getAll("images").filter((item): item is File => item instanceof File);

  if (images.length === 0) {
    return NextResponse.json({ error: "No images provided." }, { status: 400 });
  }

  if (images.length > 15) {
    return NextResponse.json({ error: "Maximum 15 images allowed." }, { status: 400 });
  }

  try {
    const uploads = await Promise.all(images.map((file) => uploadFile(file, folder)));
    return NextResponse.json(uploads);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
