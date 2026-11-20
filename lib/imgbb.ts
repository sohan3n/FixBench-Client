const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Please upload a valid JPG, PNG, or WebP image.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image size must be 5 MB or less.";
  }

  return null;
}

export async function uploadImageToImgbb(file: File): Promise<string> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey || apiKey === "your_imgbb_api_key") {
    throw new Error("ImgBB API key is not configured in environment variables.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { display_url?: string; url?: string };
    error?: { message?: string };
  };

  if (!response.ok || !payload.success) {
    throw new Error(
      payload.error?.message || "Failed to upload image to ImgBB."
    );
  }

  const imageUrl = payload.data?.display_url || payload.data?.url;
  if (!imageUrl) {
    throw new Error("ImgBB did not return a hosted image URL.");
  }

  return imageUrl;
}