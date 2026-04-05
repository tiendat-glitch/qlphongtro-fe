import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  const data = await req.json();
  fs.writeFileSync(path.join(process.cwd(), 'apidump.json'), JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}
