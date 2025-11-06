import { requireRole } from '@/server/auth';
import { db } from '@/server/db';
import { CreatorsTable } from '@/components/creators/creators-table';
import { CreatorFilters } from '@/components/creators/creator-filters';
import { Button } from '@/components/ui/button';
import { UserPlus, Download } from 'lucide-react';
import { CreatorStage, KYCStatus, RiskLevel } from '@prisma/client';

export const metadata = {
  title: 'Creators - Creator Ops Dashboard',
};

interface SearchParams {
  stage?: string;
  region?: string;
  manager?: string;
  risk?: string;
  kyc?: string;
  search?: string;
}

export default async function CreatorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireRole(['ADMIN', 'MANAGER']);

  // Await searchParams in Next.js 15
  const params = await searchParams;

  // Build where clause based on filters
  const where: any = {};

  if (params.stage) {
    where.stage = params.stage as CreatorStage;
  }

  if (params.region) {
    where.region = params.region;
  }

  if (params.manager) {
    where.managerId = params.manager;
  }

  if (params.risk) {
    where.riskLevel = params.risk as RiskLevel;
  }

  if (params.kyc) {
    where.kycStatus = params.kyc as KYCStatus;
  }

  if (params.search) {
    where.OR = [
      { handle: { contains: params.search, mode: 'insensitive' as const } },
      { displayName: { contains: params.search, mode: 'insensitive' as const } },
      { email: { contains: params.search, mode: 'insensitive' as const } },
    ];
  }

  const creators = await db.creator.findMany({
    where,
    include: {
      manager: {
        select: {
          displayName: true,
        },
      },
      liveStats: {
        select: {
          revenueUSD: true,
          diamonds: true,
        },
        take: 30,
        orderBy: {
          date: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  });

  const managers = await db.manager.findMany({
    select: {
      id: true,
      displayName: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Creator CRM</h1>
          <p className="text-muted-foreground">
            Manage and track all creators in your network
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Creator
          </Button>
        </div>
      </div>

      <CreatorFilters managers={managers} />

      <CreatorsTable creators={creators} />
    </div>
  );
}
