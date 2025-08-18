import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {
  Text,
  Card,
  Button,
  Searchbar,
  SegmentedButtons,
} from 'react-native-paper';
import {theme} from '@/utils/theme';

const CommunityScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTab, setSelectedTab] = React.useState('discover');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Buscar na comunidade..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <SegmentedButtons
          value={selectedTab}
          onValueChange={setSelectedTab}
          buttons={[
            {
              value: 'discover',
              label: 'Descobrir',
              icon: 'compass',
            },
            {
              value: 'following',
              label: 'Seguindo',
              icon: 'account-heart',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView style={styles.content}>
        {selectedTab === 'discover' ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                Descubra Receitas
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Explore receitas incríveis da comunidade.
              </Text>
              <Text variant="bodySmall" style={styles.emptySubtext}>
                Encontre inspiração, siga outros cozinheiros e compartilhe suas
                próprias criações!
              </Text>
              <View style={styles.emptyActions}>
                <Button
                  mode="contained"
                  icon="compass"
                  style={styles.emptyButton}
                  onPress={() => {
                    // Navegar para explorar
                  }}>
                  Explorar
                </Button>
                <Button
                  mode="outlined"
                  icon="share"
                  style={styles.emptyButton}
                  onPress={() => {
                    // Navegar para compartilhar receita
                  }}>
                  Compartilhar
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                Seguindo
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Você ainda não segue ninguém.
              </Text>
              <Text variant="bodySmall" style={styles.emptySubtext}>
                Comece seguindo outros cozinheiros para ver suas receitas aqui!
              </Text>
              <Button
                mode="contained"
                icon="account-search"
                style={styles.emptyButton}
                onPress={() => {
                  // Navegar para buscar usuários
                }}>
                Encontrar Cozinheiros
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    marginBottom: 12,
  },
  segmentedButtons: {
    backgroundColor: theme.colors.surface,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  emptyCard: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyButton: {
    minWidth: 140,
  },
});

export default CommunityScreen;
