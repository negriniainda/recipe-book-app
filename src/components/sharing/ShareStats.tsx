import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useGetShareStatsQuery, useGetShareAnalyticsQuery} from '../../services/sharingApi';
import {ShareContentType, SharePlatform} from '../../types/sharing';
import {colors, typography, spacing} from '../../theme';

interface ShareStatsProps {
  contentId: string;
  contentType: ShareContentType;
  userId: string;
  showAnalytics?: boolean;
}

export const ShareStats: React.FC<ShareStatsProps> = ({
  contentId,
  contentType,
  userId,
  showAnalytics = false,
}) => {
  const {data: stats, isLoading: loadingStats} = useGetShareStatsQuery({
    contentId,
    contentType,
  });

  const {data: analytics, isLoading: loadingAnalytics} = useGetShareAnalyticsQuery(
    {
      userId,
      contentId,
      contentType,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date(),
      },
    },
    {skip: !showAnalytics}
  );

  const getPlatformIcon = (platform: SharePlatform) => {
    switch (platform) {
      case 'whatsapp':
        return 'logo-whatsapp';
      case 'instagram':
        return 'logo-instagram';
      case 'facebook':
        return 'logo-facebook';
      case 'twitter':
        return 'logo-twitter';
      case 'telegram':
        return 'paper-plane';
      case 'email':
        return 'mail';
      case 'sms':
        return 'chatbubble';
      default:
        return 'share';
    }
  };

  const getPlatformColor = (platform: SharePlatform) => {
    switch (platform) {
      case 'whatsapp':
        return '#25D366';
      case 'instagram':
        return '#E4405F';
      case 'facebook':
        return '#1877F2';
      case 'twitter':
        return '#1DA1F2';
      case 'telegram':
        return '#0088CC';
      case 'email':
        return '#34495E';
      case 'sms':
        return '#2ECC71';
      default:
        return colors.gray[500];
    }
  };

  if (loadingStats) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando estatísticas...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bar-chart-outline" size={48} color={colors.gray[400]} />
        <Text style={styles.emptyText}>Nenhuma estatística disponível</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Overview Stats */}
      <View style={styles.overviewSection}>
        <Text style={styles.sectionTitle}>Resumo de Compartilhamentos</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="share" size={24} color={colors.primary[600]} />
            <Text style={styles.statValue}>{stats.totalShares}</Text>
            <Text style={styles.statLabel}>Total de Shares</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="eye" size={24} color={colors.blue[600]} />
            <Text style={styles.statValue}>{stats.uniqueViews}</Text>
            <Text style={styles.statLabel}>Visualizações</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="link" size={24} color={colors.green[600]} />
            <Text style={styles.statValue}>{stats.linkClicks}</Text>
            <Text style={styles.statLabel}>Cliques no Link</Text>
          </View>
        </View>
      </View>

      {/* Platform Breakdown */}
      <View style={styles.platformSection}>
        <Text style={styles.sectionTitle}>Compartilhamentos por Plataforma</Text>
        
        {stats.topPlatforms.map((platform, index) => (
          <View key={platform.platform} style={styles.platformItem}>
            <View style={styles.platformInfo}>
              <View style={styles.platformIcon}>
                <Ionicons
                  name={getPlatformIcon(platform.platform) as any}
                  size={20}
                  color={getPlatformColor(platform.platform)}
                />
              </View>
              <Text style={styles.platformName}>
                {platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}
              </Text>
            </View>
            
            <View style={styles.platformStats}>
              <Text style={styles.platformCount}>{platform.count}</Text>
              <Text style={styles.platformPercentage}>
                {platform.percentage.toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.platformBar}>
              <View
                style={[
                  styles.platformBarFill,
                  {
                    width: `${platform.percentage}%`,
                    backgroundColor: getPlatformColor(platform.platform),
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Format Breakdown */}
      <View style={styles.formatSection}>
        <Text style={styles.sectionTitle}>Compartilhamentos por Formato</Text>
        
        <View style={styles.formatGrid}>
          {Object.entries(stats.sharesByFormat).map(([format, count]) => (
            <View key={format} style={styles.formatCard}>
              <Ionicons
                name={
                  format === 'image' ? 'image' :
                  format === 'pdf' ? 'document' :
                  format === 'link' ? 'link' : 'text'
                }
                size={20}
                color={colors.gray[600]}
              />
              <Text style={styles.formatCount}>{count}</Text>
              <Text style={styles.formatLabel}>
                {format.charAt(0).toUpperCase() + format.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Timeline Analytics */}
      {showAnalytics && analytics && (
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Atividade dos Últimos 30 Dias</Text>
          
          <View style={styles.timelineContainer}>
            {analytics.timeline.slice(-7).map((day, index) => (
              <View key={day.date} style={styles.timelineDay}>
                <View style={styles.timelineBar}>
                  <View
                    style={[
                      styles.timelineBarFill,
                      {
                        height: `${Math.max(10, (day.shares / Math.max(...analytics.timeline.map(d => d.shares))) * 100)}%`,
                        backgroundColor: colors.primary[500],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.timelineValue}>{day.shares}</Text>
                <Text style={styles.timelineDate}>
                  {new Date(day.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Last Shared */}
      {stats.lastSharedAt && (
        <View style={styles.lastSharedSection}>
          <Text style={styles.sectionTitle}>Último Compartilhamento</Text>
          <Text style={styles.lastSharedText}>
            {new Date(stats.lastSharedAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.gray[500],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray[500],
    marginTop: spacing.md,
  },
  overviewSection: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
  },
  statValue: {
    ...typography.title,
    fontWeight: '700',
    color: colors.gray[900],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray[600],
    textAlign: 'center',
  },
  platformSection: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  platformName: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: '500',
  },
  platformStats: {
    alignItems: 'flex-end',
    marginRight: spacing.md,
  },
  platformCount: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
  },
  platformPercentage: {
    ...typography.caption,
    color: colors.gray[500],
  },
  platformBar: {
    width: 60,
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
  },
  platformBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  formatSection: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  formatGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formatCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
  },
  formatCount: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  formatLabel: {
    ...typography.caption,
    color: colors.gray[600],
    textAlign: 'center',
  },
  analyticsSection: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: spacing.sm,
  },
  timelineDay: {
    flex: 1,
    alignItems: 'center',
  },
  timelineBar: {
    width: '100%',
    height: 80,
    backgroundColor: colors.gray[100],
    borderRadius: 4,
    justifyContent: 'flex-end',
    marginBottom: spacing.xs,
  },
  timelineBarFill: {
    width: '100%',
    borderRadius: 4,
  },
  timelineValue: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  timelineDate: {
    ...typography.caption,
    color: colors.gray[500],
    fontSize: 10,
  },
  lastSharedSection: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  lastSharedText: {
    ...typography.body,
    color: colors.gray[700],
  },
});