export type ImgbbResult = {
  url: string;
  thumbnailUrl: string;
  fileType: "image";
  fileSize: number;
  originalName: string;
};

export async function uploadToImgbb(
  base64: string,
  originalName: string,
  fileSize: number
): Promise<ImgbbResult> {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) throw new Error("IMGBB_API_KEY is not set");

  const form = new FormData();
  form.append("key", apiKey);
  form.append("image", base64);
  form.append("name", originalName.replace(/\.[^.]+$/, ""));

  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error(`imgbb upload failed: ${res.status}`);
  const json = await res.json();
  const data = json?.data;
  if (!data?.url) throw new Error("imgbb returned no URL");

  return {
    url: data.url,
    thumbnailUrl: data.thumb?.url ?? data.url,
    fileType: "image",
    fileSize,
    originalName,
  };
}