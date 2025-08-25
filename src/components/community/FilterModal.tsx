import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Modal,
  Portal,
  Appbar,
  Text,
  Chip,
  Card,
  Button,
  Slider,
  Switch,
  Divider,
} from 'react-native-paper';
import { CommunityFeedFilters } from '../../types/community';

interface FilterModalProps {
  visible: boolean;
  filters: CommunityFeedFilters;
  onDismiss: () => void;
  onApply: (filters: CommunityFeedFilters) => void;
  onClear: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  filters,
  onDismiss,
  onApply,
  onClear,
}) => {
  const [localFilters, setLocalFilters] = useState<CommunityFeedFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const categories = [
    'Doces',
    'Salgados',
    'Bebidas',
    'Massas',
    'Carnes',
    'Peixes',
    'Vegetariano',
    'Vegano',
    'Sem Glúten',
    'Low Carb',
  ];

  const popularTags = [
    'facil',
    'rapido',
    'saudavel',
    'familia',
    'festa',
    'sobremesa',
    'jantar',
    'almoco',
    'cafe-da-manha',
    'lanche',
  ];

  const handleCategoryToggle = (category: string) => {
    setLocalFilters(prev => ({
      ...prev,
      category: prev.category === category ? undefined : category,
    }));
  };

  const handleDifficultyToggle = (difficulty: 'easy' | 'medium' | 'hard') => {
    setLocalFilters(prev => ({
      ...prev,
      difficulty: prev.difficulty === difficulty ? undefined : difficulty,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setLocalFilters(prev => {
      const currentTags = prev.tags || [];
      const hasTag = currentTags.includes(tag);
      
      return {
        ...prev,
        tags: hasTag
          ? currentTags.filter(t => t !== tag)
          : [...currentTags, tag],
      };
    });
  };

  const handlePrepTimeChange = (value: number) => {
    setLocalFilters(prev => ({
      ...prev,
      prepTime: value === 180 ? undefined : value,
    }));
  };

  const handleFollowingToggle = (value: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      following: value || undefined,
    }));
  };

  const handleTrendingToggle = (value: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      trending: value || undefined,
    }));
  };

  const handleRecentToggle = (value: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      recent: value || undefined,
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({});
    onClear();
  };

  const getActiveFiltersCount = () => {
    return Object.keys(localFilters).filter(
      key => localFilters[key as keyof CommunityFeedFilters] !== undefined
    ).length;
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Appbar.Header>
          <Appbar.Action icon="close" onPress={onDismiss} />
          <Appbar.Content title="Filtros" />
          <Appbar.Action
            icon="filter-remove"
            onPress={handleClear}
            disabled={getActiveFiltersCount() === 0}
          />
        </Appbar.Header>

        <ScrollView style={styles.content}>
          {/* Tipo de Feed */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Tipo de Feed</Text>
              
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Apenas quem sigo</Text>
                <Switch
                  value={localFilters.following || false}
                  onValueChange={handleFollowingToggle}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Posts em alta</Text>
                <Switch
                  value={localFilters.trending || false}
                  onValueChange={handleTrendingToggle}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Mais recentes</Text>
                <Switch
                  value={localFilters.recent || false}
                  onValueChange={handleRecentToggle}
                />
              </View>
            </Card.Content>
          </Card>

          {/* Categorias */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Categoria</Text>
              <View style={styles.chipsContainer}>
                {categories.map((category) => (
                  <Chip
                    key={category}
                    selected={localFilters.category === category}
                    onPress={() => handleCategoryToggle(category)}
                    style={[
                      styles.chip,
                      localFilters.category === category && styles.selectedChip,
                    ]}
                    textStyle={[
                      styles.chipText,
                      localFilters.category === category && styles.selectedChipText,
                    ]}
                  >
                    {category}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Dificuldade */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Dificuldade</Text>
              <View style={styles.difficultyContainer}>
                <Chip
                  selected={localFilters.difficulty === 'easy'}
                  onPress={() => handleDifficultyToggle('easy')}
                  icon="star-outline"
                  style={[
                    styles.difficultyChip,
                    localFilters.difficulty === 'easy' && styles.selectedChip,
                  ]}
                  textStyle={[
                    styles.chipText,
                    localFilters.difficulty === 'easy' && styles.selectedChipText,
                  ]}
                >
                  Fácil
                </Chip>
                <Chip
                  selected={localFilters.difficulty === 'medium'}
                  onPress={() => handleDifficultyToggle('medium')}
                  icon="star-half-full"
                  style={[
                    styles.difficultyChip,
                    localFilters.difficulty === 'medium' && styles.selectedChip,
                  ]}
                  textStyle={[
                    styles.chipText,
                    localFilters.difficulty === 'medium' && styles.selectedChipText,
                  ]}
                >
                  Médio
                </Chip>
                <Chip
                  selected={localFilters.difficulty === 'hard'}
                  onPress={() => handleDifficultyToggle('hard')}
                  icon="star"
                  style={[
                    styles.difficultyChip,
                    localFilters.difficulty === 'hard' && styles.selectedChip,
                  ]}
                  textStyle={[
                    styles.chipText,
                    localFilters.difficulty === 'hard' && styles.selectedChipText,
                  ]}
                >
                  Difícil
                </Chip>
              </View>
            </Card.Content>
          </Card>

          {/* Tempo de Preparo */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>
                Tempo máximo: {localFilters.prepTime || 180} minutos
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={15}
                maximumValue={180}
                step={15}
                value={localFilters.prepTime || 180}
                onValueChange={handlePrepTimeChange}
                thumbColor="#2196f3"
                minimumTrackTintColor="#2196f3"
                maximumTrackTintColor="#ddd"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>15min</Text>
                <Text style={styles.sliderLabel}>3h</Text>
              </View>
            </Card.Content>
          </Card>

          {/* Tags */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Tags Populares</Text>
              <View style={styles.chipsContainer}>
                {popularTags.map((tag) => (
                  <Chip
                    key={tag}
                    selected={localFilters.tags?.includes(tag) || false}
                    onPress={() => handleTagToggle(tag)}
                    style={[
                      styles.chip,
                      localFilters.tags?.includes(tag) && styles.selectedChip,
                    ]}
                    textStyle={[
                      styles.chipText,
                      localFilters.tags?.includes(tag) && styles.selectedChipText,
                    ]}
                  >
                    #{tag}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Botões de Ação */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.actionButton}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleApply}
            style={styles.actionButton}
          >
            Aplicar ({getActiveFiltersCount()})
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f5f5f5',
    marginBottom: 4,
  },
  selectedChip: {
    backgroundColor: '#2196f3',
  },
  chipText: {
    color: '#666',
  },
  selectedChipText: {
    color: '#fff',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  difficultyChip: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    elevation: 4,
  },
  actionButton: {
    flex: 1,
  },
});

export default FilterModal;