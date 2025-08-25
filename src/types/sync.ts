export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: string | null;
  syncInProgress: boolean;
  pendingChanges: number;
  conflictsCount: number;
  syncErrors: SyncError[];
}

export interface SyncError {
  id: string;
  type: 'network' | 'conflict' | 'validation' | 'server';
  message: string;
  entityType: 'recipe' | 'list' | 'plan' | 'profile';
  entityId: string;
  timestamp: string;
  resolved: boolean;
}

export interface SyncConflict {
  id: string;
  entityType: 'recipe' | 'list' | 'plan' | 'profile';
  entityId: string;
  localVersion: any;
  remoteVersion: any;
  localTimestamp: string;
  remoteTimestamp: string;
  conflictFields: string[];
  resolution?: 'local' | 'remote' | 'merge';
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityType: 'recipe' | 'list' | 'plan' | 'profile';
  entityId: string;
  data: any;
  timestamp: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retryCount: number;
  lastError?: string;
}

export interface BackupInfo {
  id: string;
  userId: string;
  type: 'manual' | 'automatic';
  status: 'creating' | 'completed' | 'failed' | 'expired';
  size: number; // em bytes
  itemsCount: {
    recipes: number;
    lists: number;
    plans: number;
    profile: number;
  };
  createdAt: string;
  completedAt?: string;
  expiresAt?: string;
  downloadUrl?: string;
  error?: string;
}

export interface RestoreInfo {
  id: string;
  userId: string;
  backupId: string;
  status: 'preparing' | 'restoring' | 'completed' | 'failed';
  progress: number; // 0-100
  itemsRestored: {
    recipes: number;
    lists: number;
    plans: number;
    profile: number;
  };
  conflicts: RestoreConflict[];
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface RestoreConflict {
  entityType: 'recipe' | 'list' | 'plan' | 'profile';
  entityId: string;
  existingItem: any;
  backupItem: any;
  resolution: 'skip' | 'replace' | 'merge' | 'rename';
}

export interface OfflineCache {
  recipes: { [id: string]: any };
  lists: { [id: string]: any };
  plans: { [id: string]: any };
  profile: any;
  lastUpdated: string;
  version: string;
}

export interface SyncSettings {
  autoSync: boolean;
  syncInterval: number; // em minutos
  syncOnWiFiOnly: boolean;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  maxBackups: number;
  conflictResolution: 'ask' | 'local' | 'remote' | 'newest';
  syncNotifications: boolean;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop';
  platform: 'ios' | 'android' | 'web';
  version: string;
  lastSeen: string;
  isCurrentDevice: boolean;
}

export interface SyncStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  lastSuccessfulSync: string | null;
  averageSyncTime: number; // em segundos
  dataTransferred: number; // em bytes
  conflictsResolved: number;
}

// Tipos para APIs
export interface InitiateSyncRequest {
  force?: boolean;
  entities?: ('recipe' | 'list' | 'plan' | 'profile')[];
}

export interface CreateBackupRequest {
  type: 'manual' | 'automatic';
  includeImages?: boolean;
  compression?: 'none' | 'low' | 'high';
}

export interface RestoreBackupRequest {
  backupId: string;
  conflictResolution?: 'skip' | 'replace' | 'merge' | 'ask';
  restoreImages?: boolean;
}

export interface ResolveConflictRequest {
  conflictId: string;
  resolution: 'local' | 'remote' | 'merge';
  mergedData?: any;
}

export interface UpdateSyncSettingsRequest {
  autoSync?: boolean;
  syncInterval?: number;
  syncOnWiFiOnly?: boolean;
  autoBackup?: boolean;
  backupFrequency?: 'daily' | 'weekly' | 'monthly';
  maxBackups?: number;
  conflictResolution?: 'ask' | 'local' | 'remote' | 'newest';
  syncNotifications?: boolean;
}

// Estados para gerenciamento
export interface SyncState {
  status: SyncStatus;
  settings: SyncSettings;
  conflicts: SyncConflict[];
  operations: SyncOperation[];
  backups: BackupInfo[];
  restores: RestoreInfo[];
  devices: DeviceInfo[];
  stats: SyncStats;
  offlineCache: OfflineCache;
  loading: boolean;
  error: string | null;
}

// Constantes
export const SYNC_INTERVALS = [
  { value: 5, label: '5 minutos' },
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
  { value: 180, label: '3 horas' },
  { value: 360, label: '6 horas' },
  { value: 720, label: '12 horas' },
  { value: 1440, label: '24 horas' },
] as const;

export const BACKUP_FREQUENCIES = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
] as const;

export const CONFLICT_RESOLUTIONS = [
  { value: 'ask', label: 'Perguntar sempre', description: 'Solicitar decisão para cada conflito' },
  { value: 'local', label: 'Preferir local', description: 'Manter alterações locais' },
  { value: 'remote', label: 'Preferir remoto', description: 'Aceitar alterações do servidor' },
  { value: 'newest', label: 'Mais recente', description: 'Usar a versão mais recente' },
] as const;

export const MAX_BACKUP_OPTIONS = [
  { value: 3, label: '3 backups' },
  { value: 5, label: '5 backups' },
  { value: 10, label: '10 backups' },
  { value: 20, label: '20 backups' },
  { value: -1, label: 'Ilimitado' },
] as const;

// Utilitários
export const formatSyncTime = (timestamp: string | null): string => {
  if (!timestamp) return 'Nunca';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Agora mesmo';
  if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  
  return date.toLocaleDateString('pt-BR');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getSyncStatusColor = (status: SyncStatus): string => {
  if (!status.isOnline) return '#f44336'; // Offline - vermelho
  if (status.syncInProgress) return '#ff9800'; // Sincronizando - laranja
  if (status.conflictsCount > 0) return '#ff9800'; // Conflitos - laranja
  if (status.syncErrors.length > 0) return '#f44336'; // Erros - vermelho
  if (status.pendingChanges > 0) return '#2196f3'; // Pendente - azul
  return '#4caf50'; // Sincronizado - verde
};

export const getSyncStatusText = (status: SyncStatus): string => {
  if (!status.isOnline) return 'Offline';
  if (status.syncInProgress) return 'Sincronizando...';
  if (status.conflictsCount > 0) return `${status.conflictsCount} conflito${status.conflictsCount > 1 ? 's' : ''}`;
  if (status.syncErrors.length > 0) return 'Erro na sincronização';
  if (status.pendingChanges > 0) return `${status.pendingChanges} alteração${status.pendingChanges > 1 ? 'ões' : ''} pendente${status.pendingChanges > 1 ? 's' : ''}`;
  return 'Sincronizado';
};