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
  return NextResponse.json({ success: true, data: db.engagements || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = readDb();
    
    const newEngagement: EngagementItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      type: body.type || 'Comment',
      user: body.user || 'Anonymous',
      platform: body.platform || 'YouTube',
      post: body.post || '',
      time: body.time || new Date().toISOString()
    };
    
    db.engagements = [newEngagement, ...(db.engagements || [])];
    
    // Generate notification automatically based on the engagement type
    let notifMessage = '';
    let notifType = 'youtube_comment';
    
    if (newEngagement.type === 'Comment') {
      notifMessage = `💬 Bình luận mới trên ${newEngagement.platform} từ ${newEngagement.user}: "${newEngagement.post}"`;
      notifType = `${newEngagement.platform.toLowerCase()}_comment`;
    } else if (newEngagement.type === 'Subscribe') {
      notifMessage = `🎉 Kênh ${newEngagement.platform} của bạn: ${newEngagement.post}`;
      notifType = `${newEngagement.platform.toLowerCase()}_milestone`;
    } else if (newEngagement.type === 'Video') {
      notifMessage = `🔔 Video mới: ${newEngagement.post}`;
      notifType = `${newEngagement.platform.toLowerCase()}_video`;
    } else {
      notifMessage = `✨ Tương tác mới (${newEngagement.type}) từ ${newEngagement.user}`;
      notifType = `${newEngagement.platform.toLowerCase()}_interaction`;
    }
    
    const newNotification: NotificationItem = {
      id: 'notif_' + (Date.now() + Math.floor(Math.random() * 1000)),
      message: notifMessage,
      type: notifType,
      time: 'Vừa xong'
    };
    
    db.notifications = [newNotification, ...(db.notifications || [])];
    
    writeDb(db);
    
    return NextResponse.json({ success: true, data: newEngagement });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}
