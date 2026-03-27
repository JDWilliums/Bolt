import { getPlaiceholder } from "plaiceholder";

export async function getBlurDataURL(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  const { base64 } = await getPlaiceholder(buffer, { size: 10 });
  return base64;
}
