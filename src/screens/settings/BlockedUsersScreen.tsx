import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Appbar,
  List,
  Text,
  Avatar,
  Button,
  Card,
  ActivityIndicator,
  Searchbar,
} from 'react-native-paper';
import { useBlockedUsers } from '../../hooks/usePrivacy';
import { BlockedUser } from '../../types/privacy';

interface BlockedUsersScreenProps {
  navigation: any;
}

const BlockedUsersScreen: React.FC<BlockedUsersScreenProps> = ({
  navigation,
}) => {
  const {
    users,
    hasMore,
    isLoading,
    isFetching,
    error,
    refetch,
    loadMore,
    unblockUser,
    isUnblocking,
  } = useBlockedUsers();

  const handleUnblockUser = useCallback((userId: string, username: string) => {
    unblockUser(userId, username);
  }, [unblockUser]);

  const renderUser = useCallback(({ item }: { item: BlockedUser }) => (
    <Card style={styles.userCard}>
      <List.Item
        title={item.blockedUser.displayName}
        description={`@${item.blockedUser.username}`}
        left={() => (
          <Avatar.Image
            size={48}
            source={{ uri: item.blockedUser.avatar }}
          />
        )}
        right={() => (
          <Button
            mode="outlined"
            onPress={() => handleUnblockUser(item.blockedUserId, item.blockedUser.username)}
            disabled={isUnblocking}
            style={styles.unblockButton}
          >
            Desbloquear
          </Button>
        )}
      />
      {item.reason && (
        <Card.Content style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>Motivo:</Text>
          <Text style={styles.reasonText}>{item.reason}</Text>
        </Card.Content>
      )}
      <Card.Content style={styles.dateContainer}>
        <Text style={styles.dateText}>
          Bloqueado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </Text>
      </Card.Content>
    </Card>
  ), [handleUnblockUser, isUnblocking]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando usuários bloqueados...</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>Nenhum usuário bloqueado</Text>
        <Text style={styles.emptyDescription}>
          Quando você bloquear usuários, eles aparecerão aqui.
        </Text>
        <Text style={styles.emptyHint}>
          Usuários bloqueados não podem ver seu perfil, enviar mensagens ou interagir com suas receitas.
        </Text>
      </View>
    );
  }, [isLoading]);

  const renderFooter = useCallback(() => {
    if (!isFetching || !hasMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingMoreText}>Carregando mais...</Text>
      </View>
    );
  }, [isFetching, hasMore]);

  const renderHeader = useCallback(() => (
    <View style={styles.headerContainer}>
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoTitle}>Sobre Usuários Bloqueados</Text>
          <Text style={styles.infoText}>
            • Usuários bloqueados não podem ver seu perfil ou receitas
          </Text>
          <Text style={styles.infoText}>
            • Eles não podem enviar mensagens ou comentar em suas receitas
          </Text>
          <Text style={styles.infoText}>
            • Você não verá posts ou atividades deles na comunidade
          </Text>
          <Text style={styles.infoText}>
            • Você pode desbloquear usuários a qualquer momento
          </Text>
        </Card.Content>
      </Card>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Usuários Bloqueados" />
        <Appbar.Action
          icon="help-circle"
          onPress={() => navigation.navigate('BlockingHelp')}
        />
      </Appbar.Header>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  headerContainer: {
    padding: 16,
  },
  infoCard: {
    elevation: 2,
    marginBottom: 8,
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
  userCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 1,
  },
  unblockButton: {
    alignSelf: 'center',
  },
  reasonContainer: {
    paddingTop: 0,
    paddingBottom: 8,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  dateContainer: {
    paddingTop: 0,
    paddingBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default BlockedUsersScreen;