import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { title, message, creatorHandle, priority } = await req.json();

    if (!env.LARK_WEBHOOK_URL) {
      return NextResponse.json({ error: 'Lark webhook not configured' }, { status: 400 });
    }

    const card = {
      msg_type: 'interactive',
      card: {
        header: {
          title: {
            content: title || 'Escalation Alert',
            tag: 'plain_text',
          },
          template: priority === 'URGENT' ? 'red' : 'orange',
        },
        elements: [
          {
            tag: 'div',
            text: {
              content: message,
              tag: 'plain_text',
            },
          },
          ...(creatorHandle
            ? [
                {
                  tag: 'div',
                  fields: [
                    {
                      is_short: true,
                      text: {
                        content: `**Creator:** @${creatorHandle}`,
                        tag: 'lark_md',
                      },
                    },
                  ],
                },
              ]
            : []),
          {
            tag: 'note',
            elements: [
              {
                tag: 'plain_text',
                content: `Creator Ops Division - ${new Date().toLocaleString()}`,
              },
            ],
          },
        ],
      },
    };

    const response = await fetch(env.LARK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });

    if (!response.ok) {
      throw new Error(`Lark API error: ${response.statusText}`);
    }

    logger.info({ type: 'lark_webhook', creatorHandle, priority });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error, context: 'lark_webhook' });
    return NextResponse.json({ error: 'Failed to send Lark message' }, { status: 500 });
  }
}
