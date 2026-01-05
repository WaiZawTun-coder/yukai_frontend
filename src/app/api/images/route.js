import { NextResponse } from "next/server";

export async function GET(req) {
  const url = new URL(req.url).searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }

  const res = await fetch(url);
  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": res.headers.get("content-type") || "image/*",
    },
  });
}
