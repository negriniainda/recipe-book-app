import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useFeatureAccess, useUserSubscription } from '../../hooks/usePremium';
import { PremiumStats as PremiumStatsType, FeatureUsage } from '../../types/premium';
import { AccessibleText } from '../accessibility/AccessibleText';

const screenWidth = Dimensions.get('window').width;

interface PremiumStatsProps {
  stats?: PremiumStatsType;
  showCharts?: boolean;
}

export const PremiumStats: React.FC<PremiumStatsProps> = ({
  stats,
  showCharts = true,
}) => {
  const { featureUsage } = useFeatureAccess();
  const { subscription } = useUserSubscription();

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#FF6B35',
    },
  };

  const usageData = useMemo(() => {
    if (!featureUsage) return [];
    
    return featureUsage
      .filter(usage => !usage.unlimited && usage.limit > 0)
      .map(usage => ({
        name: getFeatureName(usage.featureKey),
        usage: usage.used,
        limit: usage.limit,
        percentage: (usage.used / usage.limit) * 100,
      }));
  }, [featureUsage]);

  const getFeatureName = (featureKey: string): string => {
    const featureNames: Record<string, string> = {
      unlimitedRecipes: 'Receitas',
      unlimitedMealPlans: 'Planejamentos',
      cloudStorage: 'Armazenamento',
      aiSuggestions: 'IA',
      advancedFeaturesUsed: 'Avançados',
    };
    return featureNames[featureKey] || featureKey;
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return '#F44336';
    if (percentage >= 75) return '#FF9800';
    if (percentage >= 50) return '#FFC107';
    return '#4CAF50';
  };

  const renderUsageOverview = () => (
    <View style={styles.section}>
      <AccessibleText style={styles.sectionTitle}>
        Resumo de Uso
      </AccessibleText>
      
      <View style={styles.statsGrid}>
        {usageData.map((item, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>{item.name}</Text>
              <Text style={[
                styles.statPercentage,
                { color: getUsageColor(item.percentage) }
              ]}>
                {item.percentage.toFixed(0)}%
              </Text>
            </View>
            
            <View style={styles.statProgress}>
              <View
                style={[
                  styles.statProgressBar,
                  {
                    width: `${Math.min(item.percentage, 100)}%`,
                    backgroundColor: getUsageColor(item.percentage),
                  },
                ]}
              />
            </View>
            
            <Text style={styles.statDetails}>
              {item.usage} de {item.limit}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderFeatureUsageChart = () => {
    if (!showCharts || usageData.length === 0) return null;

    const chartData = {
      labels: usageData.map(item => item.name),
      datasets: [
        {
          data: usageData.map(item => item.percentage),
          colors: usageData.map(item => () => getUsageColor(item.percentage)),
        },
      ],
    };

    return (
      <View style={styles.section}>
        <AccessibleText style={styles.sectionTitle}>
          Uso por Recurso
        </AccessibleText>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={chartData}
            width={Math.max(screenWidth - 32, usageData.length * 80)}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
            yAxisSuffix="%"
          />
        </ScrollView>
      </View>
    );
  };

  const renderSubscriptionInfo = () => {
    if (!subscription) return null;

    const daysInPeriod = subscription.plan.interval === 'monthly' ? 30 : 365;
    const currentDate = new Date();
    const periodStart = new Date(subscription.currentPeriodStart);
    const daysPassed = Math.floor((currentDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    const periodProgress = (daysPassed / daysInPeriod) * 100;

    return (
      <View style={styles.section}>
        <AccessibleText style={styles.sectionTitle}>
          Período Atual
        </AccessibleText>
        
        <View style={styles.periodCard}>
          <View style={styles.periodHeader}>
            <Icon name="calendar" size={24} color="#FF6B35" />
            <View style={styles.periodInfo}>
              <Text style={styles.periodTitle}>
                {subscription.plan.displayName}
              </Text>
              <Text style={styles.periodDates}>
                {new Date(subscription.currentPeriodStart).toLocaleDateString('pt-BR')} - {' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>
          
          <View style={styles.periodProgress}>
            <View style={styles.periodProgressTrack}>
              <View
                style={[
                  styles.periodProgressBar,
                  { width: `${Math.min(periodProgress, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.periodProgressText}>
              {daysPassed} de {daysInPeriod} dias ({periodProgress.toFixed(0)}%)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRevenueStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.section}>
        <AccessibleText style={styles.sectionTitle}>
          Estatísticas de Receita
        </AccessibleText>
        
        <View style={styles.revenueGrid}>
          <View style={styles.revenueCard}>
            <Icon name="currency-usd" size={24} color="#4CAF50" />
            <Text style={styles.revenueValue}>
              R$ {stats.totalRevenue.toLocaleString('pt-BR')}
            </Text>
            <Text style={styles.revenueLabel}>Receita Total</Text>
          </View>
          
          <View style={styles.revenueCard}>
            <Icon name="trending-up" size={24} color="#2196F3" />
            <Text style={styles.revenueValue}>
              R$ {stats.monthlyRevenue.toLocaleString('pt-BR')}
            </Text>
            <Text style={styles.revenueLabel}>Receita Mensal</Text>
          </View>
          
          <View style={styles.revenueCard}>
            <Icon name="account-group" size={24} color="#FF9800" />
            <Text style={styles.revenueValue}>
              {stats.activeSubscriptions.toLocaleString('pt-BR')}
            </Text>
            <Text style={styles.revenueLabel}>Assinantes Ativos</Text>
          </View>
          
          <View style={styles.revenueCard}>
            <Icon name="percent" size={24} color="#9C27B0" />
            <Text style={styles.revenueValue}>
              {(stats.conversionRate * 100).toFixed(1)}%
            </Text>
            <Text style={styles.revenueLabel}>Taxa de Conversão</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRevenueChart = () => {
    if (!stats || !showCharts || !stats.revenueByMonth.length) return null;

    const chartData = {
      labels: stats.revenueByMonth.slice(-6).map(item => {
        const date = new Date(item.month);
        return date.toLocaleDateString('pt-BR', { month: 'short' });
      }),
      datasets: [
        {
          data: stats.revenueByMonth.slice(-6).map(item => item.revenue),
          strokeWidth: 2,
        },
      ],
    };

    return (
      <View style={styles.section}>
        <AccessibleText style={styles.sectionTitle}>
          Receita dos Últimos 6 Meses
        </AccessibleText>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            bezier
          />
        </ScrollView>
      </View>
    );
  };

  const renderPopularPlans = () => {
    if (!stats || !stats.popularPlans.length) return null;

    const pieData = stats.popularPlans.map((plan, index) => ({
      name: plan.planName,
      population: plan.subscriptions,
      color: [
        '#FF6B35',
        '#4CAF50',
        '#2196F3',
        '#FF9800',
        '#9C27B0',
      ][index % 5],
      legendFontColor: '#333',
      legendFontSize: 12,
    }));

    return (
      <View style={styles.section}>
        <AccessibleText style={styles.sectionTitle}>
          Planos Mais Populares
        </AccessibleText>
        
        {showCharts ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <PieChart
              data={pieData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </ScrollView>
        ) : (
          <View style={styles.plansList}>
            {stats.popularPlans.map((plan, index) => (
              <View key={plan.planId} style={styles.planItem}>
                <View style={[
                  styles.planColor,
                  { backgroundColor: pieData[index]?.color || '#666' }
                ]} />
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.planName}</Text>
                  <Text style={styles.planStats}>
                    {plan.subscriptions} assinantes • R$ {plan.revenue.toLocaleString('pt-BR')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderUsageOverview()}
      {renderFeatureUsageChart()}
      {renderSubscriptionInfo()}
      {renderRevenueStats()}
      {renderRevenueChart()}
      {renderPopularPlans()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  section: {
    margin: 16,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  statPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statProgress: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  statProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  statDetails: {
    fontSize: 12,
    color: '#666',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  periodCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  periodDates: {
    fontSize: 14,
    color: '#666',
  },
  periodProgress: {
    gap: 8,
  },
  periodProgressTrack: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  periodProgressBar: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  periodProgressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  revenueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  revenueCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  revenueValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  revenueLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  plansList: {
    gap: 12,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  planColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  planStats: {
    fontSize: 14,
    color: '#666',
  },
});