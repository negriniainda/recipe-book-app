import React from 'react';
import {View, StyleSheet} from 'react-native';
import {
  Text,
  ProgressBar,
  Card,
  IconButton,
  Chip,
} from 'react-native-paper';
// Define theme inline to avoid import issues
const theme = {
  colors: {
    primary: '#6200EE',
    secondary: '#03DAC6',
    surface: '#FFFFFF',
    background: '#F5F5F5',
    outline: '#79747E',
    surfaceVariant: '#E7E0EC',
    onSurface: '#1C1B1F',
  },
  roundness: 8,
};

interface ImportStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress?: number;
}

interface ImportProgressProps {
  steps: ImportStep[];
  currentStep: string;
  onCancel?: () => void;
  style?: any;
}

const ImportProgress: React.FC<ImportProgressProps> = ({
  steps,
  currentStep,
  onCancel,
  style,
}) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const currentStepData = steps[currentStepIndex];
  const overallProgress = currentStepIndex / (steps.length - 1);

  const getStepIcon = (status: ImportStep['status']) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'active':
        return 'loading';
      case 'error':
        return 'alert-circle';
      default:
        return 'circle-outline';
    }
  };

  const getStepColor = (status: ImportStep['status']) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'active':
        return theme.colors.primary;
      case 'error':
        return '#F44336';
      default:
        return theme.colors.outline;
    }
  };

  return (
    <Card style={[styles.container, style]}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            Importando Receita
          </Text>
          {onCancel && (
            <IconButton
              icon="close"
              size={20}
              onPress={onCancel}
            />
          )}
        </View>

        {/* Overall Progress */}
        <View style={styles.overallProgress}>
          <ProgressBar
            progress={overallProgress}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <Text variant="bodySmall" style={styles.progressText}>
            {Math.round(overallProgress * 100)}% concluído
          </Text>
        </View>

        {/* Current Step */}
        {currentStepData && (
          <View style={styles.currentStep}>
            <View style={styles.currentStepHeader}>
              <IconButton
                icon={getStepIcon(currentStepData.status)}
                iconColor={getStepColor(currentStepData.status)}
                size={24}
                style={styles.currentStepIcon}
              />
              <View style={styles.currentStepText}>
                <Text variant="titleSmall" style={styles.currentStepTitle}>
                  {currentStepData.title}
                </Text>
                <Text variant="bodySmall" style={styles.currentStepDescription}>
                  {currentStepData.description}
                </Text>
              </View>
            </View>

            {/* Step-specific progress */}
            {currentStepData.progress !== undefined && (
              <ProgressBar
                progress={currentStepData.progress}
                color={getStepColor(currentStepData.status)}
                style={styles.stepProgressBar}
              />
            )}
          </View>
        )}

        {/* Steps List */}
        <View style={styles.stepsList}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepItem}>
              <View style={styles.stepIndicator}>
                <IconButton
                  icon={getStepIcon(step.status)}
                  iconColor={getStepColor(step.status)}
                  size={16}
                  style={styles.stepIcon}
                />
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      {
                        backgroundColor:
                          step.status === 'completed'
                            ? '#4CAF50'
                            : theme.colors.outline + '40',
                      },
                    ]}
                  />
                )}
              </View>
              
              <View style={styles.stepContent}>
                <Text
                  variant="bodySmall"
                  style={[
                    styles.stepTitle,
                    {
                      color:
                        step.status === 'active'
                          ? theme.colors.primary
                          : step.status === 'completed'
                          ? '#4CAF50'
                          : step.status === 'error'
                          ? '#F44336'
                          : theme.colors.onSurface + '60',
                    },
                  ]}>
                  {step.title}
                </Text>
                
                {step.status === 'error' && (
                  <Chip
                    mode="flat"
                    textStyle={styles.errorChipText}
                    style={styles.errorChip}>
                    Erro
                  </Chip>
                )}
              </View>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  overallProgress: {
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  currentStep: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: theme.colors.surfaceVariant + '40',
    borderRadius: theme.roundness,
  },
  currentStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentStepIcon: {
    margin: 0,
    marginRight: 8,
  },
  currentStepText: {
    flex: 1,
  },
  currentStepTitle: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  currentStepDescription: {
    opacity: 0.7,
    marginTop: 2,
  },
  stepProgressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  stepsList: {
    marginTop: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 12,
  },
  stepIcon: {
    margin: 0,
  },
  stepConnector: {
    width: 2,
    height: 20,
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
    paddingTop: 8,
  },
  stepTitle: {
    fontWeight: '500',
  },
  errorChip: {
    backgroundColor: '#FFEBEE',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  errorChipText: {
    color: '#C62828',
    fontSize: 10,
  },
});

export default ImportProgress;