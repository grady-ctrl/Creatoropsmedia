import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { message, creatorHandle, type } = await req.json();

    if (!env.DISCORD_WEBHOOK_URL) {
      return NextResponse.json({ error: 'Discord webhook not configured' }, { status: 400 });
    }

    const embed = {
      title: type === 'announcement' ? '📢 Announcement' : '💬 Message',
      description: message,
      color: type === 'announcement' ? 0x5865f2 : 0x57f287,
      fields: creatorHandle
        ? [{ name: 'Creator', value: `@${creatorHandle}`, inline: true }]
        : [],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Creator Ops Division',
      },
    };

    const response = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.statusText}`);
    }

    logger.info({ type: 'discord_webhook', creatorHandle, messageType: type });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error, context: 'discord_webhook' });
    return NextResponse.json({ error: 'Failed to send Discord message' }, { status: 500 });
  }
}
