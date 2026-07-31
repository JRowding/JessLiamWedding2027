import process from "node:process";

export async function POST(request: Request) {
  const recipient = process.env.RSVP_RECIPIENT;

  if (!recipient) {
    return Response.json({ error: "RSVP delivery has not been configured." }, { status: 500 });
  }

  const submission = await request.json();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0];
  const host = forwardedHost ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = request.headers.get("origin") ?? (host ? `${protocol}://${host}` : new URL(request.url).origin);
  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: origin,
      Referer: `${origin}/`,
    },
    body: JSON.stringify(submission),
  });

  const responseText = await response.text();
  let result: { success?: boolean | string } = {};
  try {
    result = JSON.parse(responseText) as { success?: boolean | string };
  } catch {
    return Response.json({ error: "Could not send RSVP." }, { status: 502 });
  }
  if (!response.ok || (result.success !== true && result.success !== "true")) {
    return Response.json({ error: "Could not send RSVP." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
