type SpotifySyncRecord = {
  status: string;
  syncType: string;
  startedAt: Date;
  finishedAt: Date | null;
  lastSyncedAt: Date | null;
  lastFullSyncedAt: Date | null;
  totalImported: number;
  totalUpdated: number;
  totalMarkedRemoved: number;
  errorMessage: string | null;
};

export type SpotifySyncStatus = {
  status: string;
  syncType: string;
  startedAt: string;
  finishedAt: string | null;
  lastSyncedAt: string | null;
  lastFullSyncedAt: string | null;
  totalImported: number;
  totalUpdated: number;
  totalMarkedRemoved: number;
  errorMessage: string | null;
};

function toIsoString(value: Date | null) {
  return value ? value.toISOString() : null;
}

export function mapSpotifySyncStatus(record: SpotifySyncRecord | null): SpotifySyncStatus | null {
  if (!record) {
    return null;
  }

  return {
    status: record.status,
    syncType: record.syncType,
    startedAt: record.startedAt.toISOString(),
    finishedAt: toIsoString(record.finishedAt),
    lastSyncedAt: toIsoString(record.lastSyncedAt),
    lastFullSyncedAt: toIsoString(record.lastFullSyncedAt),
    totalImported: record.totalImported,
    totalUpdated: record.totalUpdated,
    totalMarkedRemoved: record.totalMarkedRemoved,
    errorMessage: record.errorMessage,
  };
}
