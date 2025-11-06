import { PrismaClient, Role, CreatorStage, KYCStatus, RiskLevel, PayoutStatus, PayoutMethod, TaskStatus, TaskPriority, TicketStatus, TicketChannel, TicketPriority, ComplianceEventType, ComplianceSeverity, ComplianceStatus } from '@prisma/client';
import { subDays, format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const prisma = new PrismaClient();

// Seed configuration
const CREATOR_COUNT = 25;
const LIVE_STAT_DAYS = 60;
const regions = ['US-East', 'US-West', 'EU', 'APAC', 'LATAM'];
const creatorNames = [
  'Nova', 'Kairo', 'Mika', 'Zara', 'Luna', 'Phoenix', 'Sage', 'River', 'Storm', 'Echo',
  'Blaze', 'Frost', 'Aurora', 'Ember', 'Crystal', 'Shadow', 'Skylar', 'Raven', 'Jade', 'Onyx',
  'Atlas', 'Lyra', 'Orion', 'Stella', 'Celeste'
];

const tags = ['high-performer', 'new-creator', 'needs-support', 'top-earner', 'growth-potential', 'at-risk'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function main() {
  console.log('🚀 Seeding Creator Ops Division database...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.notionSyncState.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.complianceEvent.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.task.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.liveStat.deleteMany();
  await prisma.creator.deleteMany();
  await prisma.manager.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.appSetting.deleteMany();
  console.log('✅ Database cleaned\n');

  // Create Admin user
  console.log('👤 Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@creatorops.us',
      name: 'Admin User',
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Admin created: ${adminUser.email}\n`);

  // Create Finance user
  console.log('💰 Creating finance user...');
  const financeUser = await prisma.user.create({
    data: {
      email: 'finance@creatorops.us',
      name: 'Finance Team',
      role: Role.FINANCE,
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Finance user created: ${financeUser.email}\n`);

  // Create Managers
  console.log('👥 Creating managers...');
  const managerData = [
    { name: 'Sarah Chen', email: 'sarah@creatorops.us', timezone: 'America/Los_Angeles' },
    { name: 'Marcus Johnson', email: 'marcus@creatorops.us', timezone: 'America/New_York' },
    { name: 'Emma Rodriguez', email: 'emma@creatorops.us', timezone: 'America/Chicago' },
    { name: 'David Kim', email: 'david@creatorops.us', timezone: 'Asia/Seoul' },
  ];

  const managers = [];
  for (const data of managerData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: Role.MANAGER,
        emailVerified: new Date(),
      },
    });

    const manager = await prisma.manager.create({
      data: {
        userId: user.id,
        displayName: data.name,
        timezone: data.timezone,
        notes: `Manager since ${format(new Date(), 'MMMM yyyy')}`,
      },
    });

    managers.push(manager);
    console.log(`  ✓ ${data.name}`);
  }
  console.log(`✅ Created ${managers.length} managers\n`);

  // Create Creators
  console.log('🎭 Creating creators...');
  const creators = [];
  const stages: CreatorStage[] = ['LEAD', 'APPLIED', 'ONBOARDING', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'PAUSED'];

  for (let i = 0; i < CREATOR_COUNT; i++) {
    const name = creatorNames[i];
    const handle = `${name.toLowerCase()}${randomInt(100, 999)}`;
    const stage = i < 3 ? stages[i] : (i < 20 ? CreatorStage.ACTIVE : randomElement(stages));
    const joinDate = stage === CreatorStage.ACTIVE ? subDays(new Date(), randomInt(30, 180)) :
                     stage === CreatorStage.ONBOARDING ? subDays(new Date(), randomInt(1, 14)) :
                     stage === CreatorStage.PAUSED ? subDays(new Date(), randomInt(60, 120)) : null;

    const manager = stage === CreatorStage.ACTIVE || stage === CreatorStage.ONBOARDING || stage === CreatorStage.PAUSED
      ? randomElement(managers)
      : null;

    const creator = await prisma.creator.create({
      data: {
        handle,
        displayName: name,
        stage,
        region: randomElement(regions),
        tiktokUserId: stage !== CreatorStage.LEAD ? `tt_${randomInt(100000000, 999999999)}` : null,
        joinDate,
        managerId: manager?.id,
        discordId: stage === CreatorStage.ACTIVE || stage === CreatorStage.ONBOARDING ? `${randomInt(100000000000000000, 999999999999999999)}` : null,
        discordUsername: stage === CreatorStage.ACTIVE || stage === CreatorStage.ONBOARDING ? `${handle}#${randomInt(1000, 9999)}` : null,
        email: `${handle}@example.com`,
        phone: `+1${randomInt(2000000000, 9999999999)}`,
        tags: stage === CreatorStage.ACTIVE ? randomElements(tags, randomInt(1, 3)) : [],
        riskLevel: stage === CreatorStage.ACTIVE ? (randomInt(1, 100) > 90 ? RiskLevel.HIGH : randomInt(1, 100) > 70 ? RiskLevel.MEDIUM : RiskLevel.LOW) : RiskLevel.LOW,
        kycStatus: stage === CreatorStage.ACTIVE ? KYCStatus.APPROVED :
                   stage === CreatorStage.ONBOARDING ? KYCStatus.PENDING :
                   KYCStatus.NOT_STARTED,
        notes: stage === CreatorStage.ACTIVE ? `Joined via referral. ${randomInt(1, 10) > 7 ? 'Strong performer.' : 'Consistent streamer.'}` : null,
        lastLiveAt: stage === CreatorStage.ACTIVE ? subDays(new Date(), randomInt(0, 3)) : null,
        lastContactAt: stage === CreatorStage.ACTIVE || stage === CreatorStage.ONBOARDING ? subDays(new Date(), randomInt(0, 7)) : null,
      },
    });

    creators.push(creator);
    console.log(`  ✓ ${name} (@${handle}) - ${stage}`);
  }
  console.log(`✅ Created ${creators.length} creators\n`);

  // Create Referrals
  console.log('🔗 Creating referrals...');
  const activeCreators = creators.filter(c => c.stage === CreatorStage.ACTIVE);
  const referralCount = Math.min(8, Math.floor(activeCreators.length / 3));

  for (let i = 0; i < referralCount; i++) {
    const referrer = activeCreators[i];
    const referred = activeCreators[i + 5];

    if (referrer && referred && referrer.id !== referred.id) {
      const qualified = randomInt(1, 100) > 30;
      const date = subDays(new Date(), randomInt(15, 60));

      await prisma.referral.create({
        data: {
          referrerCreatorId: referrer.id,
          referredCreatorId: referred.id,
          date,
          qualified,
          qualifiedAt: qualified ? subDays(date, -randomInt(7, 21)) : null,
          bonusUSD: qualified ? randomFloat(50, 200) : 0,
          notes: qualified ? 'Met 30-day activity threshold' : 'Pending qualification',
        },
      });

      // Update referred creator's referredBy field
      await prisma.creator.update({
        where: { id: referred.id },
        data: { referredByCreatorId: referrer.id },
      });

      console.log(`  ✓ ${referrer.handle} → ${referred.handle} ${qualified ? '(qualified)' : ''}`);
    }
  }
  console.log(`✅ Created ${referralCount} referrals\n`);

  // Create LiveStats for active creators
  console.log('📊 Creating live stats (this may take a moment)...');
  let statCount = 0;

  for (const creator of creators) {
    if (creator.stage !== CreatorStage.ACTIVE) continue;

    // Determine creator tier for realistic performance distribution
    const tier = randomInt(1, 100);
    let baseRevenue, baseMinutes, baseViewers;

    if (tier > 95) { // Top 5% - Elite performers
      baseRevenue = randomFloat(800, 1500);
      baseMinutes = randomInt(180, 300);
      baseViewers = randomInt(800, 2000);
    } else if (tier > 80) { // 15% - High performers
      baseRevenue = randomFloat(300, 800);
      baseMinutes = randomInt(120, 240);
      baseViewers = randomInt(400, 800);
    } else if (tier > 50) { // 30% - Mid performers
      baseRevenue = randomFloat(100, 300);
      baseMinutes = randomInt(60, 180);
      baseViewers = randomInt(150, 400);
    } else { // 50% - Learning/growing
      baseRevenue = randomFloat(20, 100);
      baseMinutes = randomInt(30, 120);
      baseViewers = randomInt(50, 200);
    }

    for (let d = 0; d < LIVE_STAT_DAYS; d++) {
      const date = subDays(new Date(), d);

      // Some creators don't stream every day
      if (randomInt(1, 100) > 70) continue;

      // Add variance and trend (slight growth over time)
      const growthFactor = 1 + ((LIVE_STAT_DAYS - d) / LIVE_STAT_DAYS) * 0.3;
      const variance = randomFloat(0.7, 1.3);

      const liveMinutes = Math.floor(baseMinutes * variance * growthFactor);
      const averageViewers = Math.floor(baseViewers * variance * growthFactor);
      const peakViewers = Math.floor(averageViewers * randomFloat(1.5, 3));
      const revenueUSD = baseRevenue * variance * growthFactor;
      const diamonds = Math.floor(revenueUSD * 2); // ~$0.50 per diamond
      const giftsCount = Math.floor(diamonds * randomFloat(0.3, 0.8));

      await prisma.liveStat.create({
        data: {
          creatorId: creator.id,
          date,
          liveMinutes,
          averageViewers,
          peakViewers,
          diamonds,
          giftsCount,
          revenueUSD,
          ctr: randomFloat(0.02, 0.08),
          retention: randomFloat(0.3, 0.7),
        },
      });

      statCount++;
    }
  }
  console.log(`✅ Created ${statCount} live stat records\n`);

  // Create Payouts
  console.log('💸 Creating payouts...');
  const now = new Date();
  const lastPeriodEnd = endOfMonth(subMonths(now, 1));
  const lastPeriodStart = startOfMonth(subMonths(now, 1));
  const currentPeriodStart = startOfMonth(now);
  const currentPeriodEnd = endOfMonth(now);

  let payoutCount = 0;
  for (const creator of creators) {
    if (creator.stage !== CreatorStage.ACTIVE) continue;

    // Get stats for last period
    const lastPeriodStats = await prisma.liveStat.aggregate({
      where: {
        creatorId: creator.id,
        date: {
          gte: lastPeriodStart,
          lte: lastPeriodEnd,
        },
      },
      _sum: {
        diamonds: true,
        revenueUSD: true,
      },
    });

    if (lastPeriodStats._sum.revenueUSD && lastPeriodStats._sum.revenueUSD > 0) {
      const revenueUSD = lastPeriodStats._sum.revenueUSD;
      const diamonds = lastPeriodStats._sum.diamonds || 0;
      const feeUSD = revenueUSD * 0.15; // 15% platform fee
      const bonusUSD = revenueUSD > 1000 ? randomFloat(50, 150) : 0;
      const netUSD = revenueUSD - feeUSD + bonusUSD;

      await prisma.payout.create({
        data: {
          creatorId: creator.id,
          periodStart: lastPeriodStart,
          periodEnd: lastPeriodEnd,
          diamonds,
          revenueUSD,
          feeUSD,
          bonusUSD,
          netUSD,
          status: PayoutStatus.PAID,
          method: randomElement([PayoutMethod.WISE, PayoutMethod.PAYPAL, PayoutMethod.WISE, PayoutMethod.WISE]),
          reference: `PAY-${format(lastPeriodEnd, 'yyyyMM')}-${randomInt(10000, 99999)}`,
          paidAt: subDays(now, randomInt(1, 5)),
        },
      });
      payoutCount++;
    }

    // Current period - DUE or PROCESSING
    const currentPeriodStats = await prisma.liveStat.aggregate({
      where: {
        creatorId: creator.id,
        date: {
          gte: currentPeriodStart,
          lte: now,
        },
      },
      _sum: {
        diamonds: true,
        revenueUSD: true,
      },
    });

    if (currentPeriodStats._sum.revenueUSD && currentPeriodStats._sum.revenueUSD > 50) {
      const revenueUSD = currentPeriodStats._sum.revenueUSD;
      const diamonds = currentPeriodStats._sum.diamonds || 0;
      const feeUSD = revenueUSD * 0.15;
      const bonusUSD = revenueUSD > 1000 ? randomFloat(50, 150) : 0;
      const netUSD = revenueUSD - feeUSD + bonusUSD;

      await prisma.payout.create({
        data: {
          creatorId: creator.id,
          periodStart: currentPeriodStart,
          periodEnd: currentPeriodEnd,
          diamonds,
          revenueUSD,
          feeUSD,
          bonusUSD,
          netUSD,
          status: randomInt(1, 100) > 80 ? PayoutStatus.PROCESSING : PayoutStatus.DUE,
          method: randomElement([PayoutMethod.WISE, PayoutMethod.PAYPAL, PayoutMethod.WISE]),
        },
      });
      payoutCount++;
    }
  }
  console.log(`✅ Created ${payoutCount} payouts\n`);

  // Create Tasks
  console.log('✅ Creating tasks...');
  const taskTypes = ['Onboarding', 'KYC Review', 'Content Review', 'Performance Check', 'Follow-up', 'Equipment Setup'];
  const onboardingCreators = creators.filter(c => c.stage === CreatorStage.ONBOARDING);
  const activeCreators2 = creators.filter(c => c.stage === CreatorStage.ACTIVE);

  let taskCount = 0;

  // Tasks for onboarding creators
  for (const creator of onboardingCreators) {
    await prisma.task.create({
      data: {
        assigneeManagerId: creator.managerId || randomElement(managers).id,
        creatorId: creator.id,
        type: 'Onboarding',
        title: `Complete onboarding for @${creator.handle}`,
        description: 'Walk through platform setup, streaming guidelines, and payout information',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueAt: subDays(new Date(), -randomInt(1, 3)),
        checklist: {
          items: [
            { text: 'Send welcome pack', completed: true },
            { text: 'Discord access granted', completed: true },
            { text: 'KYC submitted', completed: false },
            { text: 'First stream scheduled', completed: false },
          ],
        },
      },
    });
    taskCount++;
  }

  // Random tasks for active creators
  for (let i = 0; i < 15; i++) {
    const creator = randomElement(activeCreators2);
    const status = randomElement([TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE, TaskStatus.OPEN]);

    await prisma.task.create({
      data: {
        assigneeManagerId: creator.managerId || randomElement(managers).id,
        creatorId: creator.id,
        type: randomElement(taskTypes),
        title: `${randomElement(taskTypes)} - @${creator.handle}`,
        description: 'Review recent performance metrics and provide feedback',
        status,
        priority: randomElement([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.MEDIUM]),
        dueAt: status !== TaskStatus.DONE ? subDays(new Date(), -randomInt(1, 7)) : null,
        completedAt: status === TaskStatus.DONE ? subDays(new Date(), randomInt(1, 5)) : null,
      },
    });
    taskCount++;
  }
  console.log(`✅ Created ${taskCount} tasks\n`);

  // Create Support Tickets
  console.log('🎫 Creating support tickets...');
  const ticketSubjects = [
    'Payment not received',
    'Stream quality issues',
    'Account access problem',
    'Technical support needed',
    'Payout inquiry',
    'Guidelines clarification',
    'Equipment recommendation',
    'Collaboration opportunity',
  ];

  let ticketCount = 0;
  for (let i = 0; i < 12; i++) {
    const creator = randomElement([...onboardingCreators, ...activeCreators2]);
    const status = randomElement([TicketStatus.OPEN, TicketStatus.PENDING, TicketStatus.RESOLVED, TicketStatus.OPEN]);
    const subject = randomElement(ticketSubjects);

    const messages = [
      {
        from: 'creator',
        text: `Hi, I need help with: ${subject.toLowerCase()}`,
        timestamp: subDays(new Date(), randomInt(1, 5)).toISOString(),
      },
    ];

    if (status !== TicketStatus.OPEN) {
      messages.push({
        from: 'manager',
        text: 'Thanks for reaching out! Let me look into this for you.',
        timestamp: subDays(new Date(), randomInt(0, 3)).toISOString(),
      });
    }

    if (status === TicketStatus.RESOLVED) {
      messages.push({
        from: 'creator',
        text: 'Thank you! This is resolved.',
        timestamp: subDays(new Date(), randomInt(0, 1)).toISOString(),
      });
    }

    await prisma.ticket.create({
      data: {
        creatorId: creator.id,
        channel: randomElement([TicketChannel.DISCORD, TicketChannel.EMAIL, TicketChannel.DISCORD]),
        subject,
        status,
        priority: randomElement([TicketPriority.MEDIUM, TicketPriority.LOW, TicketPriority.HIGH, TicketPriority.MEDIUM]),
        assignedManagerId: creator.managerId,
        messages,
        resolvedAt: status === TicketStatus.RESOLVED ? subDays(new Date(), randomInt(0, 2)) : null,
      },
    });
    ticketCount++;
  }
  console.log(`✅ Created ${ticketCount} tickets\n`);

  // Create Compliance Events
  console.log('⚖️  Creating compliance events...');
  const highRiskCreators = creators.filter(c => c.riskLevel === RiskLevel.HIGH || c.riskLevel === RiskLevel.MEDIUM);

  let complianceCount = 0;
  for (const creator of highRiskCreators) {
    if (randomInt(1, 100) > 60) {
      await prisma.complianceEvent.create({
        data: {
          creatorId: creator.id,
          type: randomElement([ComplianceEventType.CONTENT_FLAG, ComplianceEventType.PLATFORM_WARNING, ComplianceEventType.BAN_RISK]),
          severity: creator.riskLevel === RiskLevel.HIGH ? ComplianceSeverity.CRITICAL : ComplianceSeverity.WARNING,
          status: randomInt(1, 100) > 50 ? ComplianceStatus.RESOLVED : ComplianceStatus.UNDER_REVIEW,
          title: 'Content guideline review needed',
          details: 'Automated flag triggered. Manual review required.',
          resolvedAt: randomInt(1, 100) > 50 ? subDays(new Date(), randomInt(1, 10)) : null,
        },
      });
      complianceCount++;
    }
  }

  // KYC events for onboarding
  for (const creator of onboardingCreators) {
    await prisma.complianceEvent.create({
      data: {
        creatorId: creator.id,
        type: ComplianceEventType.KYC,
        severity: ComplianceSeverity.INFO,
        status: ComplianceStatus.UNDER_REVIEW,
        title: 'KYC verification pending',
        details: 'Documents submitted, awaiting verification.',
      },
    });
    complianceCount++;
  }
  console.log(`✅ Created ${complianceCount} compliance events\n`);

  // Create sample Audit Logs
  console.log('📝 Creating audit logs...');
  const sampleCreator = activeCreators2[0];
  const auditLogs = [
    {
      userId: adminUser.id,
      action: 'creator.updated',
      entity: 'Creator',
      entityId: sampleCreator.id,
      creatorId: sampleCreator.id,
      before: { stage: 'ONBOARDING' },
      after: { stage: 'ACTIVE' },
    },
    {
      userId: managers[0].userId,
      action: 'payout.created',
      entity: 'Payout',
      entityId: 'sample-payout-id',
      creatorId: sampleCreator.id,
      after: { status: 'DUE', amount: 500 },
    },
    {
      userId: financeUser.id,
      action: 'payout.marked_paid',
      entity: 'Payout',
      entityId: 'sample-payout-id',
      creatorId: sampleCreator.id,
      before: { status: 'DUE' },
      after: { status: 'PAID' },
    },
  ];

  for (const log of auditLogs) {
    await prisma.auditLog.create({ data: log });
  }
  console.log(`✅ Created ${auditLogs.length} audit logs\n`);

  // Create App Settings
  console.log('⚙️  Creating app settings...');
  await prisma.appSetting.createMany({
    data: [
      {
        key: 'branding.accentColor',
        value: { color: '#6366f1' },
      },
      {
        key: 'branding.logo',
        value: { url: '/logo.png' },
      },
      {
        key: 'payouts.defaultMethod',
        value: { method: 'WISE' },
      },
      {
        key: 'payouts.feePercentage',
        value: { percentage: 15 },
      },
      {
        key: 'referrals.qualificationDays',
        value: { days: 30 },
      },
      {
        key: 'referrals.bonusAmount',
        value: { amountUSD: 100 },
      },
    ],
  });
  console.log('✅ App settings configured\n');

  // Summary
  console.log('═══════════════════════════════════════════');
  console.log('✨ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   Users: ${1 + 1 + managers.length} (1 admin, 1 finance, ${managers.length} managers)`);
  console.log(`   Creators: ${creators.length}`);
  console.log(`   Live Stats: ${statCount}`);
  console.log(`   Payouts: ${payoutCount}`);
  console.log(`   Referrals: ${referralCount}`);
  console.log(`   Tasks: ${taskCount}`);
  console.log(`   Tickets: ${ticketCount}`);
  console.log(`   Compliance Events: ${complianceCount}`);
  console.log('═══════════════════════════════════════════\n');
  console.log('🔐 Login credentials:');
  console.log('   Admin:   admin@creatorops.us');
  console.log('   Finance: finance@creatorops.us');
  console.log('   Manager: sarah@creatorops.us');
  console.log('\n💡 Use magic link auth in development\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
