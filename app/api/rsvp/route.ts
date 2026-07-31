export async function POST(request: Request) {
  const recipient = process.env.RSVP_RECIPIENT;

  if (!recipient) {
    return Response.json({ error: "RSVP delivery has not been configured." }, { status: 500 });
  }

  const submission = await request.json();
  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    return Response.json({ error: "Could not send RSVP." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
