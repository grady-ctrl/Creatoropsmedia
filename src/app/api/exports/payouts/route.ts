import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/server/auth';
import { db } from '@/server/db';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'FINANCE']);

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');

    const where = status ? { status: status as any } : {};

    const payouts = await db.payout.findMany({
      where,
      include: {
        creator: { select: { handle: true, displayName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Creator Handle',
      'Creator Name',
      'Email',
      'Period Start',
      'Period End',
      'Diamonds',
      'Revenue USD',
      'Fee USD',
      'Bonus USD',
      'Net USD',
      'Status',
      'Method',
      'Reference',
      'Paid At',
      'Created At',
    ];

    const rows = payouts.map(payout => [
      payout.creator.handle,
      payout.creator.displayName || '',
      payout.creator.email || '',
      format(payout.periodStart, 'yyyy-MM-dd'),
      format(payout.periodEnd, 'yyyy-MM-dd'),
      payout.diamonds,
      payout.revenueUSD.toFixed(2),
      payout.feeUSD.toFixed(2),
      payout.bonusUSD.toFixed(2),
      payout.netUSD.toFixed(2),
      payout.status,
      payout.method,
      payout.reference || '',
      payout.paidAt ? format(payout.paidAt, 'yyyy-MM-dd HH:mm:ss') : '',
      format(payout.createdAt, 'yyyy-MM-dd HH:mm:ss'),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="payouts-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export payouts' }, { status: 500 });
  }
}
