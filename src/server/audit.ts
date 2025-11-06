import { db } from './db';
import { logger } from '@/lib/logger';

interface AuditLogData {
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  creatorId?: string;
  before?: any;
  after?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await db.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        creatorId: data.creatorId,
        before: data.before ? JSON.parse(JSON.stringify(data.before)) : null,
        after: data.after ? JSON.parse(JSON.stringify(data.after)) : null,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    logger.info({
      type: 'audit',
      userId: data.userId,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
    });
  } catch (error) {
    logger.error({ error, message: 'Failed to create audit log' });
  }
}

export function auditCreatorChange(
  userId: string | undefined,
  creatorId: string,
  action: string,
  before: any,
  after: any
) {
  return createAuditLog({
    userId,
    action: `creator.${action}`,
    entity: 'Creator',
    entityId: creatorId,
    creatorId,
    before,
    after,
  });
}

export function auditPayoutChange(
  userId: string | undefined,
  payoutId: string,
  creatorId: string,
  action: string,
  before: any,
  after: any
) {
  return createAuditLog({
    userId,
    action: `payout.${action}`,
    entity: 'Payout',
    entityId: payoutId,
    creatorId,
    before,
    after,
  });
}

export function auditTaskChange(
  userId: string | undefined,
  taskId: string,
  action: string,
  before: any,
  after: any
) {
  return createAuditLog({
    userId,
    action: `task.${action}`,
    entity: 'Task',
    entityId: taskId,
    before,
    after,
  });
}

export function auditTicketChange(
  userId: string | undefined,
  ticketId: string,
  creatorId: string,
  action: string,
  before: any,
  after: any
) {
  return createAuditLog({
    userId,
    action: `ticket.${action}`,
    entity: 'Ticket',
    entityId: ticketId,
    creatorId,
    before,
    after,
  });
}
