import { db } from "@/lib/db"

export async function logAudit(params: {
  adminUserId: string
  action: string
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
}) {
  return db.adminAuditLog.create({
    data: {
      adminUserId: params.adminUserId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  })
}
