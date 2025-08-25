import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Appbar,
  List,
  Text,
  Card,
  Button,
  Divider,
  ActivityIndicator,
  Chip,
  Dialog,
  Portal,
  TextInput,
} from 'react-native-paper';
import { useDataExport, useAccountDeletion } from '../../hooks/usePrivacy';
import { DataExportRequest } from '../../types/privacy';

interface DataPrivacyScreenProps {
  navigation: any;
}

const DataPrivacyScreen: React.FC<DataPrivacyScreenProps> = ({
  navigation,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  const {
    exports,
    isLoading: exportsLoading,
    requestExport,
    downloadExport,
    deleteExport,
    isRequesting,
  } = useDataExport();

  const {
    deletionRequest,
    isLoading: deletionLoading,
    requestDeletion,
    cancelDeletion,
    isRequesting: isDeletionRequesting,
    isCancelling,
  } = useAccountDeletion();

  const handleRequestExport = useCallback((type: 'full' | 'recipes' | 'profile' | 'activity') => {
    const typeLabels = {
      full: 'todos os dados',
      recipes: 'receitas',
      profile: 'perfil',
      activity: 'atividade',
    };

    Alert.alert(
      'Exportar Dados',
      `Tem certeza que deseja exportar ${typeLabels[type]}? O processo pode levar alguns minutos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => requestExport({ type }),
        },
      ]
    );
  }, [requestExport]);

  const handleDownloadExport = useCallback((exportItem: DataExportRequest) => {
    if (exportItem.status === 'completed' && exportItem.downloadUrl) {
      downloadExport(exportItem.id, `export-${exportItem.type}-${exportItem.id}.zip`);
    }
  }, [downloadExport]);

  const handleDeleteExport = useCallback((exportId: string) => {
    deleteExport(exportId);
  }, [deleteExport]);

  const handleRequestDeletion = useCallback(() => {
    if (!deletePassword.trim()) {
      Alert.alert('Erro', 'Digite sua senha para confirmar');
      return;
    }

    requestDeletion({
      password: deletePassword,
      reason: deleteReason.trim() || undefined,
    });

    setShowDeleteDialog(false);
    setDeletePassword('');
    setDeleteReason('');
  }, [deletePassword, deleteReason, requestDeletion]);

  const handleCancelDeletion = useCallback(() => {
    cancelDeletion();
  }, [cancelDeletion]);

  const getExportStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'processing':
        return '#ff9800';
      case 'failed':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };

  const getExportStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'processing':
        return 'Processando';
      case 'completed':
        return 'Concluído';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  const getExportTypeLabel = (type: string) => {
    switch (type) {
      case 'full':
        return 'Dados Completos';
      case 'recipes':
        return 'Receitas';
      case 'profile':
        return 'Perfil';
      case 'activity':
        return 'Atividade';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntilDeletion = () => {
    if (!deletionRequest) return 0;
    const scheduledDate = new Date(deletionRequest.scheduledFor);
    const now = new Date();
    const diffTime = scheduledDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Dados e Privacidade" />
        <Appbar.Action
          icon="help-circle"
          onPress={() => navigation.navigate('DataPrivacyHelp')}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Informações sobre LGPD/GDPR */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>Seus Direitos de Privacidade</Text>
            <Text style={styles.infoText}>
              De acordo com a LGPD e GDPR, você tem direito a:
            </Text>
            <Text style={styles.infoText}>• Acessar seus dados pessoais</Text>
            <Text style={styles.infoText}>• Exportar seus dados</Text>
            <Text style={styles.infoText}>• Corrigir informações incorretas</Text>
            <Text style={styles.infoText}>• Deletar sua conta e dados</Text>
            <Text style={styles.infoText}>• Revogar consentimentos</Text>
          </Card.Content>
        </Card>

        {/* Exportação de Dados */}
        <List.Section>
          <List.Subheader>Exportação de Dados</List.Subheader>
          
          <List.Item
            title="Exportar Todos os Dados"
            description="Baixar um arquivo com todos os seus dados"
            left={(props) => <List.Icon {...props} icon="download" />}
            right={() => (
              <Button
                mode="outlined"
                onPress={() => handleRequestExport('full')}
                disabled={isRequesting}
              >
                Exportar
              </Button>
            )}
          />

          <List.Item
            title="Exportar Apenas Receitas"
            description="Baixar suas receitas em formato JSON"
            left={(props) => <List.Icon {...props} icon="book-open" />}
            right={() => (
              <Button
                mode="outlined"
                onPress={() => handleRequestExport('recipes')}
                disabled={isRequesting}
              >
                Exportar
              </Button>
            )}
          />

          <List.Item
            title="Exportar Perfil"
            description="Baixar informações do seu perfil"
            left={(props) => <List.Icon {...props} icon="account" />}
            right={() => (
              <Button
                mode="outlined"
                onPress={() => handleRequestExport('profile')}
                disabled={isRequesting}
              >
                Exportar
              </Button>
            )}
          />

          <List.Item
            title="Exportar Atividade"
            description="Baixar histórico de atividades"
            left={(props) => <List.Icon {...props} icon="timeline" />}
            right={() => (
              <Button
                mode="outlined"
                onPress={() => handleRequestExport('activity')}
                disabled={isRequesting}
              >
                Exportar
              </Button>
            )}
          />
        </List.Section>

        {/* Exportações Existentes */}
        {!exportsLoading && exports.length > 0 && (
          <>
            <Divider />
            <List.Section>
              <List.Subheader>Exportações Recentes</List.Subheader>
              
              {exports.map((exportItem) => (
                <Card key={exportItem.id} style={styles.exportCard}>
                  <Card.Content>
                    <View style={styles.exportHeader}>
                      <Text style={styles.exportTitle}>
                        {getExportTypeLabel(exportItem.type)}
                      </Text>
                      <Chip
                        style={[
                          styles.statusChip,
                          { backgroundColor: getExportStatusColor(exportItem.status) },
                        ]}
                        textStyle={styles.statusChipText}
                      >
                        {getExportStatusLabel(exportItem.status)}
                      </Chip>
                    </View>
                    
                    <Text style={styles.exportDate}>
                      Solicitado em {formatDate(exportItem.createdAt)}
                    </Text>
                    
                    {exportItem.completedAt && (
                      <Text style={styles.exportDate}>
                        Concluído em {formatDate(exportItem.completedAt)}
                      </Text>
                    )}
                    
                    {exportItem.expiresAt && (
                      <Text style={styles.exportExpiry}>
                        Expira em {formatDate(exportItem.expiresAt)}
                      </Text>
                    )}
                    
                    <View style={styles.exportActions}>
                      {exportItem.status === 'completed' && (
                        <Button
                          mode="contained"
                          onPress={() => handleDownloadExport(exportItem)}
                          style={styles.downloadButton}
                        >
                          Baixar
                        </Button>
                      )}
                      
                      <Button
                        mode="outlined"
                        onPress={() => handleDeleteExport(exportItem.id)}
                        style={styles.deleteButton}
                      >
                        Deletar
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </List.Section>
          </>
        )}

        <Divider />

        {/* Exclusão de Conta */}
        <List.Section>
          <List.Subheader>Exclusão de Conta</List.Subheader>
          
          {deletionRequest ? (
            <Card style={styles.deletionCard}>
              <Card.Content>
                <Text style={styles.deletionTitle}>
                  Exclusão de Conta Agendada
                </Text>
                <Text style={styles.deletionText}>
                  Sua conta será deletada permanentemente em {getDaysUntilDeletion()} dias.
                </Text>
                <Text style={styles.deletionDate}>
                  Data agendada: {formatDate(deletionRequest.scheduledFor)}
                </Text>
                {deletionRequest.reason && (
                  <Text style={styles.deletionReason}>
                    Motivo: {deletionRequest.reason}
                  </Text>
                )}
                <Button
                  mode="contained"
                  onPress={handleCancelDeletion}
                  disabled={isCancelling}
                  loading={isCancelling}
                  style={styles.cancelDeletionButton}
                >
                  Cancelar Exclusão
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <List.Item
              title="Deletar Conta"
              description="Deletar permanentemente sua conta e todos os dados"
              left={(props) => <List.Icon {...props} icon="delete-forever" color="#f44336" />}
              right={() => (
                <Button
                  mode="outlined"
                  buttonColor="#ffebee"
                  textColor="#f44336"
                  onPress={() => setShowDeleteDialog(true)}
                >
                  Deletar
                </Button>
              )}
            />
          )}
        </List.Section>

        {/* Outras Opções */}
        <Divider />
        <List.Section>
          <List.Subheader>Outras Opções</List.Subheader>
          
          <List.Item
            title="Histórico de Privacidade"
            description="Ver log de alterações de privacidade"
            left={(props) => <List.Icon {...props} icon="history" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('PrivacyAuditLog')}
          />

          <List.Item
            title="Conexões de Terceiros"
            description="Gerenciar apps e serviços conectados"
            left={(props) => <List.Icon {...props} icon="link" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('ThirdPartyConnections')}
          />

          <List.Item
            title="Configurações de Cookies"
            description="Controlar cookies e rastreamento"
            left={(props) => <List.Icon {...props} icon="cookie" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('CookieSettings')}
          />
        </List.Section>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Dialog de Confirmação de Exclusão */}
      <Portal>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
        >
          <Dialog.Title>Deletar Conta</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.deleteWarning}>
              ⚠️ ATENÇÃO: Esta ação é irreversível!
            </Text>
            <Text style={styles.deleteDescription}>
              Sua conta será agendada para exclusão em 30 dias. Durante este período, você pode cancelar a exclusão.
            </Text>
            <Text style={styles.deleteDescription}>
              Todos os seus dados serão permanentemente deletados, incluindo:
            </Text>
            <Text style={styles.deleteList}>• Todas as suas receitas</Text>
            <Text style={styles.deleteList}>• Perfil e informações pessoais</Text>
            <Text style={styles.deleteList}>• Comentários e avaliações</Text>
            <Text style={styles.deleteList}>• Listas e planejamentos</Text>
            
            <TextInput
              mode="outlined"
              label="Senha (obrigatório)"
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
              style={styles.deleteInput}
            />
            
            <TextInput
              mode="outlined"
              label="Motivo (opcional)"
              value={deleteReason}
              onChangeText={setDeleteReason}
              multiline
              numberOfLines={3}
              style={styles.deleteInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              onPress={handleRequestDeletion}
              disabled={!deletePassword.trim() || isDeletionRequesting}
              loading={isDeletionRequesting}
              textColor="#f44336"
            >
              Confirmar Exclusão
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    margin: 16,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  exportCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 1,
  },
  exportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: 12,
    color: '#fff',
  },
  exportDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  exportExpiry: {
    fontSize: 12,
    color: '#ff9800',
    marginBottom: 8,
  },
  exportActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  downloadButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
  deletionCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    backgroundColor: '#ffebee',
  },
  deletionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 8,
  },
  deletionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  deletionDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  deletionReason: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  cancelDeletionButton: {
    backgroundColor: '#4caf50',
  },
  deleteWarning: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  deleteDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  deleteList: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginLeft: 8,
  },
  deleteInput: {
    marginTop: 16,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default DataPrivacyScreen;