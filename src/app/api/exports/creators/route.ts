import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/server/auth';
import { db } from '@/server/db';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'MANAGER']);

    const creators = await db.creator.findMany({
      include: {
        manager: { select: { displayName: true } },
        liveStats: {
          select: { revenueUSD: true, diamonds: true, liveMinutes: true },
          take: 30,
        },
      },
    });

    // Build CSV
    const headers = [
      'Handle',
      'Display Name',
      'Email',
      'Stage',
      'Region',
      'Manager',
      'Risk Level',
      'KYC Status',
      'Join Date',
      '30d Revenue',
      '30d Diamonds',
      '30d Minutes',
      'Created At',
    ];

    const rows = creators.map(creator => {
      const totalRevenue = creator.liveStats.reduce((sum, s) => sum + s.revenueUSD, 0);
      const totalDiamonds = creator.liveStats.reduce((sum, s) => sum + s.diamonds, 0);
      const totalMinutes = creator.liveStats.reduce((sum, s) => sum + s.liveMinutes, 0);

      return [
        creator.handle,
        creator.displayName || '',
        creator.email || '',
        creator.stage,
        creator.region || '',
        creator.manager?.displayName || '',
        creator.riskLevel,
        creator.kycStatus,
        creator.joinDate ? format(creator.joinDate, 'yyyy-MM-dd') : '',
        totalRevenue.toFixed(2),
        totalDiamonds,
        totalMinutes,
        format(creator.createdAt, 'yyyy-MM-dd HH:mm:ss'),
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="creators-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export creators' }, { status: 500 });
  }
}
