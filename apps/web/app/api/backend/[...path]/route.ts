import { NextRequest } from "next/server";
import { backendUrl } from "@/lib/server-auth";
import { frontendOrigin } from "@/lib/frontend-origin";
export const runtime = "nodejs";
async function forward(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (
    path.some(
      (part) =>
        !part || part === "." || part === ".." || /[\\\x00-\x1f]/.test(part),
    )
  )
    return new Response(null, { status: 400 });
  const origin = frontendOrigin(request.nextUrl.origin);
  if (
    !["GET", "HEAD"].includes(request.method) &&
    request.headers.get("origin") !== origin
  )
    return Response.json({ message: "Origen no permitido." }, { status: 403 });
  const upstream = new URL(backendUrl());
  upstream.pathname = path.map(encodeURIComponent).join("/");
  upstream.search = request.nextUrl.search;
  const headers = new Headers();
  for (const key of ["content-type", "cookie", "range", "if-range"]) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  headers.set("Origin", origin);
  try {
    const options: RequestInit & { duplex?: "half" } = {
      method: request.method,
      headers,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(180000),
    };
    if (!["GET", "HEAD"].includes(request.method)) {
      options.body = request.body;
      options.duplex = "half";
    }
    const res = await fetch(upstream, options);
    const output = new Headers();
    for (const key of [
      "content-type",
      "content-disposition",
      "content-length",
      "content-range",
      "accept-ranges",
      "etag",
      "last-modified",
      "content-security-policy",
      "x-content-type-options",
      "retry-after",
    ]) {
      const value = res.headers.get(key);
      if (value) output.set(key, value);
    }
    output.set("Cache-Control", "private, no-store");
    for (const cookie of res.headers.getSetCookie())
      output.append("Set-Cookie", cookie);
    return new Response(res.body, { status: res.status, headers: output });
  } catch {
    return Response.json(
      { message: "No se pudo conectar con el servidor." },
      { status: 502 },
    );
  }
}
export {
  forward as GET,
  forward as POST,
  forward as PATCH,
  forward as PUT,
  forward as DELETE,
  forward as HEAD,
};
