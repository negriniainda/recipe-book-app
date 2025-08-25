import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  List,
  Chip,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import {
  useAccessibilityTesting,
  useAccessibilitySettings,
} from '../../hooks/useAccessibility';
import {
  AccessibilityTest,
  AccessibilityIssue,
  WCAG_GUIDELINES,
} from '../../types/accessibility';

interface AccessibilityTesterProps {
  onTestComplete?: (results: any) => void;
}

const AccessibilityTester: React.FC<AccessibilityTesterProps> = ({
  onTestComplete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [testResults, setTestResults] = useState<AccessibilityTest[]>([]);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const {
    report,
    generateReport,
    runTest,
    runAllTests,
    isGenerating,
    isRunningTest,
    isRunningAllTests,
  } = useAccessibilityTesting();

  const { settings } = useAccessibilitySettings();

  const categories = [
    { value: 'all', label: 'Todos', icon: 'check-all' },
    { value: 'visual', label: 'Visual', icon: 'eye' },
    { value: 'auditory', label: 'Auditivo', icon: 'volume-high' },
    { value: 'motor', label: 'Motor', icon: 'gesture-tap' },
    { value: 'cognitive', label: 'Cognitivo', icon: 'brain' },
  ];

  const handleRunSingleTest = useCallback(async (testId: string) => {
    setCurrentTest(testId);
    const result = await runTest(testId);
    
    if (result.success) {
      setTestResults(prev => {
        const updated = prev.filter(t => t.id !== testId);
        return [...updated, result.test];
      });
    } else {
      Alert.alert('Erro', result.error);
    }
    
    setCurrentTest(null);
  }, [runTest]);

  const handleRunAllTests = useCallback(async () => {
    const result = await runAllTests();
    
    if (result.success) {
      // Atualizar relatório após executar todos os testes
      await generateReport();
    }
    
    if (onTestComplete) {
      onTestComplete(result);
    }
  }, [runAllTests, generateReport, onTestComplete]);

  const getTestStatusColor = (status: string): string => {
    switch (status) {
      case 'passed':
        return '#4caf50';
      case 'failed':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const getTestStatusIcon = (status: string): string => {
    switch (status) {
      case 'passed':
        return 'check-circle';
      case 'failed':
        return 'close-circle';
      case 'warning':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#fbc02d';
      case 'low':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  const renderTestCard = (test: AccessibilityTest) => (
    <Card key={test.id} style={styles.testCard}>
      <Card.Content>
        <View style={styles.testHeader}>
          <View style={styles.testInfo}>
            <Text style={styles.testName}>{test.name}</Text>
            <Text style={styles.testDescription}>{test.description}</Text>
          </View>
          <Chip
            style={[
              styles.statusChip,
              { backgroundColor: getTestStatusColor(test.status) },
            ]}
            textStyle={styles.statusChipText}
            icon={getTestStatusIcon(test.status)}
          >
            {test.status}
          </Chip>
        </View>

        {test.issues.length > 0 && (
          <View style={styles.issuesContainer}>
            <Text style={styles.issuesTitle}>
              Problemas Encontrados ({test.issues.length})
            </Text>
            {test.issues.map((issue) => (
              <View key={issue.id} style={styles.issueItem}>
                <View style={styles.issueHeader}>
                  <Chip
                    style={[
                      styles.severityChip,
                      { backgroundColor: getSeverityColor(issue.severity) },
                    ]}
                    textStyle={styles.severityChipText}
                  >
                    {issue.severity}
                  </Chip>
                  <Chip
                    mode="outlined"
                    style={styles.wcagChip}
                  >
                    WCAG {issue.wcagLevel}
                  </Chip>
                </View>
                <Text style={styles.issueDescription}>
                  {issue.description}
                </Text>
                <Text style={styles.issueSuggestion}>
                  💡 {issue.suggestion}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.testActions}>
          <Button
            mode="outlined"
            onPress={() => handleRunSingleTest(test.id)}
            loading={currentTest === test.id}
            disabled={isRunningTest || isRunningAllTests}
            style={styles.testButton}
          >
            Executar Teste
          </Button>
          <Text style={styles.lastTested}>
            Último teste: {new Date(test.lastTested).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderWCAGGuidelines = () => (
    <Card style={styles.guidelinesCard}>
      <Card.Content>
        <Text style={styles.guidelinesTitle}>Diretrizes WCAG</Text>
        
        {Object.entries(WCAG_GUIDELINES).map(([level, guidelines]) => (
          <View key={level} style={styles.wcagLevel}>
            <Text style={styles.wcagLevelTitle}>Nível {level}</Text>
            {guidelines.map((guideline, index) => (
              <Text key={index} style={styles.wcagGuideline}>
                • {guideline}
              </Text>
            ))}
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderOverallScore = () => {
    if (!report) return null;

    return (
      <Card style={styles.scoreCard}>
        <Card.Content>
          <Text style={styles.scoreTitle}>Pontuação Geral</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{report.overallScore}/100</Text>
            <ProgressBar
              progress={report.overallScore / 100}
              color={report.overallScore >= 80 ? '#4caf50' : 
                     report.overallScore >= 60 ? '#ff9800' : '#f44336'}
              style={styles.scoreProgress}
            />
          </View>
          
          <View style={styles.complianceContainer}>
            <Text style={styles.complianceTitle}>Conformidade WCAG</Text>
            <View style={styles.complianceRow}>
              <View style={styles.complianceItem}>
                <Text style={styles.complianceLabel}>A</Text>
                <Text style={styles.complianceValue}>
                  {report.wcagCompliance.levelA}%
                </Text>
              </View>
              <View style={styles.complianceItem}>
                <Text style={styles.complianceLabel}>AA</Text>
                <Text style={styles.complianceValue}>
                  {report.wcagCompliance.levelAA}%
                </Text>
              </View>
              <View style={styles.complianceItem}>
                <Text style={styles.complianceLabel}>AAA</Text>
                <Text style={styles.complianceValue}>
                  {report.wcagCompliance.levelAAA}%
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Filtrar testes por categoria
  const filteredTests = testResults.filter(test => 
    selectedCategory === 'all' || test.category === selectedCategory
  );

  return (
    <ScrollView style={styles.container}>
      {/* Pontuação Geral */}
      {renderOverallScore()}

      {/* Ações Principais */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text style={styles.actionsTitle}>Ações de Teste</Text>
          <View style={styles.actionsRow}>
            <Button
              mode="contained"
              onPress={handleRunAllTests}
              loading={isRunningAllTests}
              disabled={isRunningTest}
              style={styles.actionButton}
              icon="test-tube"
            >
              Executar Todos
            </Button>
            <Button
              mode="outlined"
              onPress={generateReport}
              loading={isGenerating}
              disabled={isRunningTest || isRunningAllTests}
              style={styles.actionButton}
              icon="chart-line"
            >
              Gerar Relatório
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Filtros de Categoria */}
      <Card style={styles.filtersCard}>
        <Card.Content>
          <Text style={styles.filtersTitle}>Filtrar por Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersRow}>
              {categories.map((category) => (
                <Chip
                  key={category.value}
                  mode={selectedCategory === category.value ? 'flat' : 'outlined'}
                  onPress={() => setSelectedCategory(category.value)}
                  style={styles.filterChip}
                  icon={category.icon}
                >
                  {category.label}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Lista de Testes */}
      <View style={styles.testsContainer}>
        {filteredTests.length > 0 ? (
          filteredTests.map(renderTestCard)
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                Nenhum teste encontrado para esta categoria.
                Execute "Executar Todos" para começar.
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Diretrizes WCAG */}
      {renderWCAGGuidelines()}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scoreCard: {
    margin: 16,
    elevation: 2,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 8,
  },
  scoreProgress: {
    width: '100%',
    height: 8,
    borderRadius: 4,
  },
  complianceContainer: {
    marginTop: 16,
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  complianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  complianceItem: {
    alignItems: 'center',
  },
  complianceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  complianceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  filtersCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  testsContainer: {
    paddingHorizontal: 16,
  },
  testCard: {
    marginBottom: 16,
    elevation: 2,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  testInfo: {
    flex: 1,
    marginRight: 12,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 12,
    color: '#fff',
  },
  issuesContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 8,
  },
  issueItem: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  issueHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  severityChip: {
    height: 24,
  },
  severityChipText: {
    fontSize: 10,
    color: '#fff',
  },
  wcagChip: {
    height: 24,
  },
  issueDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  issueSuggestion: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  testActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  testButton: {
    flex: 1,
    marginRight: 12,
  },
  lastTested: {
    fontSize: 12,
    color: '#666',
  },
  emptyCard: {
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  guidelinesCard: {
    margin: 16,
    elevation: 2,
  },
  guidelinesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  wcagLevel: {
    marginBottom: 16,
  },
  wcagLevelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 8,
  },
  wcagGuideline: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default AccessibilityTester;