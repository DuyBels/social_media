import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

interface EngagementItem {
  id: number;
  type: string;
  user: string;
  platform: string;
  post: string;
  time: string;
}

interface NotificationItem {
  id: string;
  message: string;
  type: string;
  time: string;
}

interface DatabaseSchema {
  engagements: EngagementItem[];
  notifications: NotificationItem[];
}

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(dbPath)) {
      return { engagements: [], notifications: [] };
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data || '{"engagements":[],"notifications":[]}') as DatabaseSchema;
  } catch (error) {
    console.error('Error reading db.json:', error);
    return { engagements: [], notifications: [] };
  }
}

function writeDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing db.json:', error);
  }
}

export async function GET() {
  const db = readDb();
  return NextResponse.json({ success: true, data: db.notifications || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = readDb();
    
    const newNotification: NotificationItem = {
      id: 'notif_' + (Date.now() + Math.floor(Math.random() * 1000)),
      message: body.message || 'Thông báo mới',
      type: body.type || 'youtube_interaction',
      time: body.time || 'Vừa xong'
    };
    
    db.notifications = [newNotification, ...(db.notifications || [])];
    writeDb(db);
    
    return NextResponse.json({ success: true, data: newNotification });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}
