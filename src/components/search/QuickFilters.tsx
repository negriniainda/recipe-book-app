import React, {useCallback} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Chip, Card} from 'react-native-paper';
import {RecipeFilters} from '@/types';
import {theme} from '@/utils/theme';

interface QuickFilter {
  id: string;
  label: string;
  icon?: string;
  filter: Partial<RecipeFilters>;
  color?: string;
}

interface QuickFiltersProps {
  onFilterSelect: (filter: RecipeFilters) => void;
  activeFilters: RecipeFilters;
  style?: any;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({
  onFilterSelect,
  activeFilters,
  style,
}) => {
  const quickFilters: QuickFilter[] = [
    {
      id: 'quick',
      label: 'Rápido',
      icon: 'clock-fast',
      filter: {maxPrepTime: 30, maxCookTime: 30},
      color: '#4CAF50',
    },
    {
      id: 'easy',
      label: 'Fácil',
      icon: 'thumb-up',
      filter: {difficulty: ['easy']},
      color: '#2196F3',
    },
    {
      id: 'vegetarian',
      label: 'Vegetariano',
      icon: 'leaf',
      filter: {tags: ['vegetariano']},
      color: '#8BC34A',
    },
    {
      id: 'dessert',
      label: 'Sobremesas',
      icon: 'cake',
      filter: {categories: ['Doces', 'Sobremesas']},
      color: '#E91E63',
    },
    {
      id: 'healthy',
      label: 'Saudável',
      icon: 'heart',
      filter: {tags: ['saudável', 'fitness', 'light']},
      color: '#FF5722',
    },
    {
      id: 'popular',
      label: 'Populares',
      icon: 'star',
      filter: {minRating: 4.0},
      color: '#FFC107',
    },
    {
      id: 'breakfast',
      label: 'Café da Manhã',
      icon: 'coffee',
      filter: {categories: ['Café da Manhã']},
      color: '#795548',
    },
    {
      id: 'dinner',
      label: 'Jantar',
      icon: 'silverware-fork-knife',
      filter: {categories: ['Jantar', 'Pratos Principais']},
      color: '#9C27B0',
    },
  ];

  const isFilterActive = useCallback((filter: QuickFilter) => {
    // Verificar se algum dos filtros está ativo
    if (filter.filter.maxPrepTime && activeFilters.maxPrepTime === filter.filter.maxPrepTime) {
      return true;
    }
    if (filter.filter.difficulty && activeFilters.difficulty?.some(d => filter.filter.difficulty?.includes(d))) {
      return true;
    }
    if (filter.filter.categories && activeFilters.categories?.some(c => filter.filter.categories?.includes(c))) {
      return true;
    }
    if (filter.filter.tags && activeFilters.tags?.some(t => filter.filter.tags?.includes(t))) {
      return true;
    }
    if (filter.filter.minRating && activeFilters.minRating === filter.filter.minRating) {
      return true;
    }
    return false;
  }, [activeFilters]);

  const handleFilterPress = useCallback((filter: QuickFilter) => {
    const isActive = isFilterActive(filter);
    
    if (isActive) {
      // Remover filtro ativo
      const newFilters = {...activeFilters};
      
      if (filter.filter.maxPrepTime) {
        delete newFilters.maxPrepTime;
        delete newFilters.maxCookTime;
      }
      if (filter.filter.difficulty) {
        newFilters.difficulty = newFilters.difficulty?.filter(d => !filter.filter.difficulty?.includes(d));
        if (newFilters.difficulty?.length === 0) delete newFilters.difficulty;
      }
      if (filter.filter.categories) {
        newFilters.categories = newFilters.categories?.filter(c => !filter.filter.categories?.includes(c));
        if (newFilters.categories?.length === 0) delete newFilters.categories;
      }
      if (filter.filter.tags) {
        newFilters.tags = newFilters.tags?.filter(t => !filter.filter.tags?.includes(t));
        if (newFilters.tags?.length === 0) delete newFilters.tags;
      }
      if (filter.filter.minRating) {
        delete newFilters.minRating;
      }
      
      onFilterSelect(newFilters);
    } else {
      // Adicionar filtro
      const newFilters = {...activeFilters};
      
      if (filter.filter.maxPrepTime) {
        newFilters.maxPrepTime = filter.filter.maxPrepTime;
        newFilters.maxCookTime = filter.filter.maxCookTime;
      }
      if (filter.filter.difficulty) {
        newFilters.difficulty = [...(newFilters.difficulty || []), ...filter.filter.difficulty];
      }
      if (filter.filter.categories) {
        newFilters.categories = [...(newFilters.categories || []), ...filter.filter.categories];
      }
      if (filter.filter.tags) {
        newFilters.tags = [...(newFilters.tags || []), ...filter.filter.tags];
      }
      if (filter.filter.minRating) {
        newFilters.minRating = filter.filter.minRating;
      }
      
      onFilterSelect(newFilters);
    }
  }, [activeFilters, onFilterSelect, isFilterActive]);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (activeFilters.categories?.length) count++;
    if (activeFilters.tags?.length) count++;
    if (activeFilters.difficulty?.length) count++;
    if (activeFilters.maxPrepTime) count++;
    if (activeFilters.minRating) count++;
    return count;
  }, [activeFilters]);

  return (
    <View style={[styles.container, style]}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>
              Filtros Rápidos
            </Text>
            {getActiveFiltersCount() > 0 && (
              <Chip
                mode="flat"
                compact
                style={styles.countChip}
                textStyle={styles.countChipText}>
                {getActiveFiltersCount()}
              </Chip>
            )}
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}>
            {quickFilters.map(filter => {
              const isActive = isFilterActive(filter);
              return (
                <Chip
                  key={filter.id}
                  mode={isActive ? 'flat' : 'outlined'}
                  selected={isActive}
                  onPress={() => handleFilterPress(filter)}
                  icon={filter.icon}
                  style={[
                    styles.filterChip,
                    isActive && {
                      backgroundColor: filter.color + '20',
                      borderColor: filter.color,
                    }
                  ]}
                  textStyle={[
                    styles.filterChipText,
                    isActive && {color: filter.color}
                  ]}>
                  {filter.label}
                </Chip>
              );
            })}
          </ScrollView>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '600',
  },
  countChip: {
    height: 24,
    backgroundColor: theme.colors.primary,
  },
  countChipText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  filtersContainer: {
    paddingRight: 16,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  filterChipText: {
    fontSize: 13,
  },
});

export default QuickFilters;