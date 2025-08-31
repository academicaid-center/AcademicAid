import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const key = process.env.FIREBASE_SERVER_KEY;
  if (!key) return NextResponse.json({ error: 'Server key missing' }, { status: 500 });
  const body = await req.json();
  const tokens: string[] = body.tokens || [];
  const payload = {
    registration_ids: tokens,
    notification: { title: body.title || 'AcademicAid', body: body.body || '' },
    data: body.data || {},
  };
  const res = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `key=${key}` },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return NextResponse.json(json);
}
