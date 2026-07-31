import process from "node:process";

export async function POST(request: Request) {
  const token = process.env.FORM_SUBMIT_TOKEN;
  if (!token) {
    return Response.json({ error: "RSVP delivery has not been configured." }, { status: 500 });
  }

  const submission = await request.json();
  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(token)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: "https://jlwedding2027.onrender.com",
      Referer: "https://jlwedding2027.onrender.com/",
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
