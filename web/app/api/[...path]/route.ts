import { NextRequest } from "next/server";

// Same-origin proxy to the NestJS API. Auth cookies stay first-party and
// SameSite=Lax works. It also passes on the visitor's IP, which Vercel sets
// and overwrites if a client tries to spoof it, so the API's rate limits see
// real visitors instead of Vercel's servers.
const API_URL = process.env.API_URL ?? "http://localhost:5000";

// Render's free tier can take ~50 s to wake up; don't time out before it does.
export const maxDuration = 60;

// Hop-by-hop or recomputed headers that must not be copied across.
const DROP = [
  "host",
  "connection",
  "content-length",
  "content-encoding",
  "transfer-encoding",
];

async function proxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const target = `${API_URL}/api/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  DROP.forEach((h) => headers.delete(h));
  const clientIp = req.headers.get("x-real-ip");
  if (clientIp) headers.set("x-client-ip", clientIp);
  headers.set("x-proxy-secret", process.env.PROXY_SECRET ?? "");

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method)
      ? undefined
      : await req.arrayBuffer(),
    redirect: "manual",
  });

  const out = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!DROP.includes(key) && key !== "set-cookie") out.set(key, value);
  });
  // Copy each cookie separately; joining them into one header would break them.
  upstream.headers.getSetCookie().forEach((c) => out.append("set-cookie", c));

  return new Response(upstream.body, { status: upstream.status, headers: out });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
};
