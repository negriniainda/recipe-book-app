import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {
  FAB,
  Portal,
  Modal,
  Text,
  Button,
  TextInput,
  Card,
  IconButton,
} from 'react-native-paper';
import {useRecipeImport} from '../../hooks/useRecipeImport';
import {useAuth} from '../../hooks/useAuth';
// Define theme inline to avoid import issues
const theme = {
  colors: {
    primary: '#6200EE',
    secondary: '#03DAC6',
    surface: '#FFFFFF',
    background: '#F5F5F5',
    outline: '#79747E',
  },
  roundness: 8,
};

interface QuickImportButtonProps {
  onSuccess?: (recipe: any) => void;
  style?: any;
}

const QuickImportButton: React.FC<QuickImportButtonProps> = ({
  onSuccess,
  style,
}) => {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const {user} = useAuth();
  const {
    isImporting,
    isSaving,
    importedData,
    error,
    importRecipe,
    saveRecipe,
    clearState,
    validateUrl,
    detectSourceType,
  } = useRecipeImport();

  const handleImport = async () => {
    if (!input.trim()) return;

    const result = await importRecipe(input);
    if (result && user) {
      const saved = await saveRecipe(result, user.id);
      if (saved) {
        onSuccess?.(result.recipe);
        setVisible(false);
        setInput('');
        clearState();
      }
    }
  };

  const handleClose = () => {
    setVisible(false);
    setInput('');
    clearState();
  };

  const getInputPlaceholder = () => {
    const sourceType = detectSourceType(input);
    switch (sourceType) {
      case 'url':
        return 'https://exemplo.com/receita';
      case 'social':
        return 'https://instagram.com/p/...';
      default:
        return 'Cole o link ou texto da receita';
    }
  };

  const getInputLabel = () => {
    const sourceType = detectSourceType(input);
    switch (sourceType) {
      case 'url':
        return 'Link da receita';
      case 'social':
        return 'Link das redes sociais';
      default:
        return 'Link ou texto da receita';
    }
  };

  const isValidInput = () => {
    if (!input.trim()) return false;
    
    const sourceType = detectSourceType(input);
    if (sourceType === 'url' || sourceType === 'social') {
      return validateUrl(input);
    }
    
    return input.trim().length > 10;
  };

  return (
    <>
      <FAB
        icon="import"
        label="Importar"
        onPress={() => setVisible(true)}
        style={[styles.fab, style]}
      />

      <Portal>
        <Modal
          visible={visible}
          onDismiss={handleClose}
          contentContainerStyle={styles.modal}>
          <View style={styles.header}>
            <IconButton icon="close" onPress={handleClose} />
            <Text variant="titleLarge" style={styles.title}>
              Importação Rápida
            </Text>
            <View style={styles.spacer} />
          </View>

          <View style={styles.content}>
            <Text variant="bodyMedium" style={styles.description}>
              Cole um link ou texto de receita para importar rapidamente
            </Text>

            <TextInput
              mode="outlined"
              label={getInputLabel()}
              placeholder={getInputPlaceholder()}
              value={input}
              onChangeText={setInput}
              multiline={detectSourceType(input) === 'text'}
              numberOfLines={detectSourceType(input) === 'text' ? 4 : 1}
              style={styles.input}
              error={!!error}
            />

            {error && (
              <Card style={styles.errorCard}>
                <Card.Content>
                  <Text variant="bodySmall" style={styles.errorText}>
                    {error}
                  </Text>
                </Card.Content>
              </Card>
            )}

            {importedData && (
              <Card style={styles.successCard}>
                <Card.Content>
                  <Text variant="titleSmall" style={styles.successTitle}>
                    ✅ Receita importada com sucesso!
                  </Text>
                  <Text variant="bodySmall" style={styles.successText}>
                    {importedData.recipe.title}
                  </Text>
                </Card.Content>
              </Card>
            )}

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={handleClose}
                disabled={isImporting || isSaving}
                style={styles.actionButton}>
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleImport}
                disabled={!isValidInput() || isImporting || isSaving}
                loading={isImporting || isSaving}
                style={styles.actionButton}>
                {isImporting ? 'Importando...' : isSaving ? 'Salvando...' : 'Importar'}
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: theme.colors.secondary,
  },
  modal: {
    backgroundColor: theme.colors.surface,
    margin: 20,
    borderRadius: theme.roundness,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline + '20',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  spacer: {
    width: 48,
  },
  content: {
    padding: 16,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
  },
  input: {
    backgroundColor: theme.colors.background,
    marginBottom: 16,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    marginBottom: 16,
  },
  errorText: {
    color: '#C62828',
  },
  successCard: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    marginBottom: 16,
  },
  successTitle: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  successText: {
    color: '#2E7D32',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});

export default QuickImportButton;