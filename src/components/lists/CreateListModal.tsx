import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, ScrollView, FlatList} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  TextInput,
  Switch,
  Chip,
  Avatar,
  Divider,
  IconButton,
} from 'react-native-paper';
import {
  CustomList,
  CreateCustomListInput,
  UpdateCustomListInput,
  LIST_TEMPLATES,
  LIST_COLORS,
  LIST_ICONS,
} from '@/types/lists';
import {theme} from '@/utils/theme';

interface CreateListModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (list: CreateCustomListInput | UpdateCustomListInput) => void;
  editingList?: CustomList | null;
  initialTemplate?: string;
}

const CreateListModal: React.FC<CreateListModalProps> = ({
  visible,
  onDismiss,
  onSave,
  editingList,
  initialTemplate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(LIST_COLORS[0]);
  const [icon, setIcon] = useState(LIST_ICONS[0]);
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Resetar formulário quando o modal abrir/fechar
  useEffect(() => {
    if (visible) {
      if (editingList) {
        // Modo edição
        setName(editingList.name);
        setDescription(editingList.description || '');
        setColor(editingList.color);
        setIcon(editingList.icon);
        setIsPublic(editingList.isPublic);
        setTags(editingList.tags);
      } else if (initialTemplate) {
        // Usar template
        const template = LIST_TEMPLATES.find(t => t.id === initialTemplate);
        if (template) {
          setName(template.name);
          setDescription(template.description);
          setColor(template.color);
          setIcon(template.icon);
          setTags(template.suggestedTags);
        }
      } else {
        // Novo lista vazia
        setName('');
        setDescription('');
        setColor(LIST_COLORS[0]);
        setIcon(LIST_ICONS[0]);
        setIsPublic(false);
        setTags([]);
      }
      setNewTag('');
      setShowColorPicker(false);
      setShowIconPicker(false);
    }
  }, [visible, editingList, initialTemplate]);

  const handleSave = useCallback(() => {
    if (!name.trim()) return;

    const listData = {
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      icon,
      isPublic,
      tags,
      recipeIds: [],
      sortBy: 'dateAdded' as const,
      sortOrder: 'desc' as const,
    };

    if (editingList) {
      onSave({
        id: editingList.id,
        ...listData,
      } as UpdateCustomListInput);
    } else {
      onSave({
        ...listData,
        userId: 'current-user', // TODO: Pegar do estado de auth
      } as CreateCustomListInput);
    }

    onDismiss();
  }, [name, description, color, icon, isPublic, tags, editingList, onSave, onDismiss]);

  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  }, [newTag, tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags]);

  const renderColorOption = useCallback(({item}: {item: string}) => (
    <IconButton
      icon={color === item ? 'check' : 'circle'}
      iconColor={color === item ? 'white' : item}
      style={[styles.colorOption, {backgroundColor: item}]}
      onPress={() => {
        setColor(item);
        setShowColorPicker(false);
      }}
    />
  ), [color]);

  const renderIconOption = useCallback(({item}: {item: string}) => (
    <IconButton
      icon={item}
      iconColor={icon === item ? theme.colors.primary : theme.colors.onSurface}
      style={[
        styles.iconOption,
        icon === item && styles.selectedIconOption,
      ]}
      onPress={() => {
        setIcon(item);
        setShowIconPicker(false);
      }}
    />
  ), [icon]);

  const isValid = name.trim().length > 0;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            {editingList ? 'Editar Lista' : 'Nova Lista'}
          </Text>
          <IconButton
            icon="close"
            size={24}
            onPress={onDismiss}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Preview */}
          <View style={styles.preview}>
            <Avatar.Icon
              size={64}
              icon={icon}
              style={[styles.previewAvatar, {backgroundColor: color}]}
            />
            <View style={styles.previewInfo}>
              <Text variant="titleLarge" style={styles.previewName}>
                {name || 'Nome da Lista'}
              </Text>
              {description && (
                <Text variant="bodyMedium" style={styles.previewDescription}>
                  {description}
                </Text>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Nome */}
          <TextInput
            mode="outlined"
            label="Nome da Lista"
            value={name}
            onChangeText={setName}
            placeholder="Ex: Receitas Favoritas"
            style={styles.input}
            maxLength={50}
          />

          {/* Descrição */}
          <TextInput
            mode="outlined"
            label="Descrição (opcional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Descreva sua lista..."
            multiline
            numberOfLines={3}
            style={styles.input}
            maxLength={200}
          />

          {/* Cor */}
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Cor
            </Text>
            <View style={styles.colorSection}>
              <IconButton
                icon="palette"
                iconColor="white"
                style={[styles.selectedColor, {backgroundColor: color}]}
                onPress={() => setShowColorPicker(!showColorPicker)}
              />
              {showColorPicker && (
                <FlatList
                  data={LIST_COLORS}
                  renderItem={renderColorOption}
                  keyExtractor={item => item}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.colorPicker}
                />
              )}
            </View>
          </View>

          {/* Ícone */}
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Ícone
            </Text>
            <View style={styles.iconSection}>
              <IconButton
                icon={icon}
                iconColor={theme.colors.primary}
                style={styles.selectedIcon}
                onPress={() => setShowIconPicker(!showIconPicker)}
              />
              {showIconPicker && (
                <FlatList
                  data={LIST_ICONS}
                  renderItem={renderIconOption}
                  keyExtractor={item => item}
                  numColumns={5}
                  style={styles.iconPicker}
                />
              )}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Tags
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Adicionar tag..."
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={handleAddTag}
              right={
                <TextInput.Icon
                  icon="plus"
                  onPress={handleAddTag}
                  disabled={!newTag.trim()}
                />
              }
              style={styles.tagInput}
            />
            {tags.length > 0 && (
              <View style={styles.tags}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    mode="flat"
                    onClose={() => handleRemoveTag(tag)}
                    style={styles.tag}>
                    {tag}
                  </Chip>
                ))}
              </View>
            )}
          </View>

          {/* Visibilidade */}
          <View style={styles.section}>
            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text variant="titleSmall">Lista Pública</Text>
                <Text variant="bodySmall" style={styles.switchDescription}>
                  Outras pessoas podem encontrar e visualizar esta lista
                </Text>
              </View>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                color={theme.colors.primary}
              />
            </View>
          </View>
        </ScrollView>

        <Divider style={styles.divider} />

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.button}>
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={!isValid}
            style={styles.button}>
            {editingList ? 'Salvar' : 'Criar Lista'}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: theme.colors.surface,
    margin: 20,
    borderRadius: theme.roundness,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  content: {
    paddingHorizontal: 20,
    maxHeight: 500,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background,
    borderRadius: theme.roundness,
    marginBottom: 16,
  },
  previewAvatar: {
    marginRight: 16,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewDescription: {
    opacity: 0.7,
  },
  divider: {
    marginVertical: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: theme.colors.background,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  colorSection: {
    alignItems: 'flex-start',
  },
  selectedColor: {
    marginBottom: 8,
  },
  colorPicker: {
    maxHeight: 60,
  },
  colorOption: {
    marginRight: 8,
    borderRadius: 20,
  },
  iconSection: {
    alignItems: 'flex-start',
  },
  selectedIcon: {
    backgroundColor: theme.colors.primaryContainer || theme.colors.surface,
    marginBottom: 8,
  },
  iconPicker: {
    maxHeight: 200,
  },
  iconOption: {
    margin: 4,
  },
  selectedIconOption: {
    backgroundColor: theme.colors.primaryContainer || theme.colors.surface,
  },
  tagInput: {
    marginBottom: 12,
    backgroundColor: theme.colors.background,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginBottom: 4,
    backgroundColor: theme.colors.primaryContainer || theme.colors.surface,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    opacity: 0.7,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default CreateListModal;