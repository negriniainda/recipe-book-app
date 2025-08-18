import React, {useState, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {Searchbar, IconButton, Menu, Chip} from 'react-native-paper';
import {theme} from '@/utils/theme';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: (text: string) => void;
  onVoiceSearch?: () => void;
  onFilterPress?: () => void;
  loading?: boolean;
  showVoiceSearch?: boolean;
  showFilters?: boolean;
  activeFiltersCount?: number;
  style?: any;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Buscar receitas...',
  value,
  onChangeText,
  onSubmit,
  onVoiceSearch,
  onFilterPress,
  loading = false,
  showVoiceSearch = true,
  showFilters = true,
  activeFiltersCount = 0,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSubmit = useCallback(() => {
    if (onSubmit && value.trim()) {
      onSubmit(value.trim());
    }
  }, [onSubmit, value]);

  const handleVoiceSearch = useCallback(() => {
    setMenuVisible(false);
    onVoiceSearch?.();
  }, [onVoiceSearch]);

  const handleFilterPress = useCallback(() => {
    setMenuVisible(false);
    onFilterPress?.();
  }, [onFilterPress]);

  const renderTrailingIcon = useCallback(() => {
    if (loading) {
      return null; // O Searchbar já mostra o loading
    }

    if (!showVoiceSearch && !showFilters) {
      return null;
    }

    if (showVoiceSearch && !showFilters) {
      return (
        <IconButton
          icon="microphone"
          size={20}
          onPress={onVoiceSearch}
          style={styles.iconButton}
        />
      );
    }

    if (!showVoiceSearch && showFilters) {
      return (
        <View style={styles.filterContainer}>
          {activeFiltersCount > 0 && (
            <Chip
              mode="flat"
              compact
              style={styles.filterChip}
              textStyle={styles.filterChipText}>
              {activeFiltersCount}
            </Chip>
          )}
          <IconButton
            icon="tune"
            size={20}
            onPress={onFilterPress}
            style={styles.iconButton}
          />
        </View>
      );
    }

    // Ambos disponíveis - mostrar menu
    return (
      <View style={styles.actionsContainer}>
        {activeFiltersCount > 0 && (
          <Chip
            mode="flat"
            compact
            style={styles.filterChip}
            textStyle={styles.filterChipText}>
            {activeFiltersCount}
          </Chip>
        )}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => setMenuVisible(true)}
              style={styles.iconButton}
            />
          }>
          <Menu.Item
            onPress={handleVoiceSearch}
            title="Busca por voz"
            leadingIcon="microphone"
          />
          <Menu.Item
            onPress={handleFilterPress}
            title="Filtros"
            leadingIcon="tune"
          />
        </Menu>
      </View>
    );
  }, [
    loading,
    showVoiceSearch,
    showFilters,
    activeFiltersCount,
    menuVisible,
    onVoiceSearch,
    onFilterPress,
    handleVoiceSearch,
    handleFilterPress,
  ]);

  return (
    <View style={[styles.container, style]}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        onSubmitEditing={handleSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        loading={loading}
        style={[
          styles.searchbar,
          isFocused && styles.searchbarFocused,
        ]}
        inputStyle={styles.searchInput}
        right={renderTrailingIcon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchbar: {
    elevation: 2,
    backgroundColor: theme.colors.surface,
  },
  searchbarFocused: {
    elevation: 4,
    backgroundColor: theme.colors.background,
  },
  searchInput: {
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    margin: 0,
  },
  filterChip: {
    height: 24,
    marginRight: 4,
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SearchBar;