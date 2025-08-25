import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {colors, typography, spacing} from '../../theme';

interface CreateListModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const nameInputRef = useRef<TextInput>(null);

  const resetForm = () => {
    setName('');
    setDescription('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    
    onCreate(name.trim(), description.trim() || undefined);
    resetForm();
  };

  const generateSuggestedName = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    return `Lista de ${dateStr}`;
  };

  const useSuggestedName = () => {
    setName(generateSuggestedName());
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancelar</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Nova Lista</Text>
          
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!name.trim()}
            style={[
              styles.createButton,
              !name.trim() && styles.createButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.createButtonText,
                !name.trim() && styles.createButtonTextDisabled,
              ]}
            >
              Criar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Name Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Nome da Lista *</Text>
            <TextInput
              ref={nameInputRef}
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Compras da semana, Lista do churrasco..."
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => {
                // Focus description input if available
              }}
            />
            
            {!name && (
              <TouchableOpacity
                style={styles.suggestionButton}
                onPress={useSuggestedName}
              >
                <Text style={styles.suggestionText}>
                  💡 Usar "{generateSuggestedName()}"
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              style={[styles.textInput, styles.descriptionInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Adicione uma descrição para sua lista..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
          </View>

          {/* Quick Templates */}
          <View style={styles.section}>
            <Text style={styles.label}>Modelos Rápidos</Text>
            <View style={styles.templateGrid}>
              {[
                {name: 'Compras da Semana', desc: 'Lista básica semanal'},
                {name: 'Festa/Evento', desc: 'Para ocasiões especiais'},
                {name: 'Ingredientes Básicos', desc: 'Itens essenciais'},
                {name: 'Limpeza', desc: 'Produtos de limpeza'},
              ].map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.templateCard}
                  onPress={() => {
                    setName(template.name);
                    setDescription(template.desc);
                  }}
                >
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateDesc}>{template.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  cancelButton: {
    ...typography.body,
    color: colors.gray[600],
  },
  title: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
  },
  createButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary[500],
    borderRadius: 6,
  },
  createButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  createButtonText: {
    ...typography.button,
    color: colors.white,
  },
  createButtonTextDisabled: {
    color: colors.gray[500],
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.caption,
    color: colors.gray[700],
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  descriptionInput: {
    height: 80,
  },
  suggestionButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  suggestionText: {
    ...typography.caption,
    color: colors.primary[600],
    fontStyle: 'italic',
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  templateCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  templateName: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  templateDesc: {
    ...typography.caption,
    color: colors.gray[500],
    fontSize: 11,
  },
});