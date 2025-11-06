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
  searchParams: SearchParams;
}) {
  await requireRole(['ADMIN', 'MANAGER']);

  // Build where clause based on filters
  const where: any = {};

  if (searchParams.stage) {
    where.stage = searchParams.stage as CreatorStage;
  }

  if (searchParams.region) {
    where.region = searchParams.region;
  }

  if (searchParams.manager) {
    where.managerId = searchParams.manager;
  }

  if (searchParams.risk) {
    where.riskLevel = searchParams.risk as RiskLevel;
  }

  if (searchParams.kyc) {
    where.kycStatus = searchParams.kyc as KYCStatus;
  }

  if (searchParams.search) {
    where.OR = [
      { handle: { contains: searchParams.search, mode: 'insensitive' as const } },
      { displayName: { contains: searchParams.search, mode: 'insensitive' as const } },
      { email: { contains: searchParams.search, mode: 'insensitive' as const } },
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
