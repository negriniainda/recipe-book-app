import React, {useState, useCallback} from 'react';
import {View, StyleSheet, FlatList, ListRenderItem} from 'react-native';
import {
  Text,
  TextInput,
  IconButton,
  Card,
  Button,
  Chip,
} from 'react-native-paper';
import {Instruction} from '@/types';
import {theme} from '@/utils/theme';

interface InstructionInputProps {
  instructions: Instruction[];
  onInstructionsChange: (instructions: Instruction[]) => void;
  style?: any;
}

const InstructionInput: React.FC<InstructionInputProps> = ({
  instructions,
  onInstructionsChange,
  style,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newInstruction, setNewInstruction] = useState({
    description: '',
    duration: '',
    temperature: '',
  });

  const addInstruction = useCallback(() => {
    if (!newInstruction.description.trim()) return;

    const instruction: Instruction = {
      id: Date.now().toString(),
      stepNumber: editingIndex !== null ? editingIndex + 1 : instructions.length + 1,
      description: newInstruction.description.trim(),
      duration: newInstruction.duration ? parseInt(newInstruction.duration) : undefined,
      temperature: newInstruction.temperature ? parseInt(newInstruction.temperature) : undefined,
    };

    if (editingIndex !== null) {
      // Editando instrução existente
      const updatedInstructions = [...instructions];
      updatedInstructions[editingIndex] = instruction;
      onInstructionsChange(updatedInstructions);
      setEditingIndex(null);
    } else {
      // Adicionando nova instrução
      onInstructionsChange([...instructions, instruction]);
    }

    // Resetar formulário
    setNewInstruction({
      description: '',
      duration: '',
      temperature: '',
    });
  }, [newInstruction, instructions, onInstructionsChange, editingIndex]);

  const editInstruction = useCallback((index: number) => {
    const instruction = instructions[index];
    setNewInstruction({
      description: instruction.description,
      duration: instruction.duration?.toString() || '',
      temperature: instruction.temperature?.toString() || '',
    });
    setEditingIndex(index);
  }, [instructions]);

  const removeInstruction = useCallback((index: number) => {
    const updatedInstructions = instructions
      .filter((_, i) => i !== index)
      .map((instruction, i) => ({
        ...instruction,
        stepNumber: i + 1,
      }));
    onInstructionsChange(updatedInstructions);
  }, [instructions, onInstructionsChange]);

  const moveInstruction = useCallback((fromIndex: number, toIndex: number) => {
    const updatedInstructions = [...instructions];
    const [movedItem] = updatedInstructions.splice(fromIndex, 1);
    updatedInstructions.splice(toIndex, 0, movedItem);
    
    // Renumerar os passos
    const renumberedInstructions = updatedInstructions.map((instruction, i) => ({
      ...instruction,
      stepNumber: i + 1,
    }));
    
    onInstructionsChange(renumberedInstructions);
  }, [instructions, onInstructionsChange]);

  const cancelEdit = useCallback(() => {
    setEditingIndex(null);
    setNewInstruction({
      description: '',
      duration: '',
      temperature: '',
    });
  }, []);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const renderInstruction: ListRenderItem<Instruction> = useCallback(
    ({item, index}) => (
      <Card style={styles.instructionCard}>
        <Card.Content style={styles.instructionContent}>
          <View style={styles.instructionHeader}>
            <Text variant="titleSmall" style={styles.stepNumber}>
              Passo {item.stepNumber}
            </Text>
            <View style={styles.instructionMeta}>
              {item.duration && (
                <Chip mode="outlined" compact style={styles.metaChip}>
                  {formatDuration(item.duration)}
                </Chip>
              )}
              {item.temperature && (
                <Chip mode="outlined" compact style={styles.metaChip}>
                  {item.temperature}°C
                </Chip>
              )}
            </View>
          </View>
          
          <Text variant="bodyMedium" style={styles.instructionText}>
            {item.description}
          </Text>

          <View style={styles.instructionActions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => editInstruction(index)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => removeInstruction(index)}
            />
            {index > 0 && (
              <IconButton
                icon="arrow-up"
                size={20}
                onPress={() => moveInstruction(index, index - 1)}
              />
            )}
            {index < instructions.length - 1 && (
              <IconButton
                icon="arrow-down"
                size={20}
                onPress={() => moveInstruction(index, index + 1)}
              />
            )}
          </View>
        </Card.Content>
      </Card>
    ),
    [instructions.length, editInstruction, removeInstruction, moveInstruction],
  );

  return (
    <View style={[styles.container, style]}>
      <Text variant="titleMedium" style={styles.title}>
        Modo de Preparo
      </Text>

      {/* Formulário de instrução */}
      <Card style={styles.formCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.formTitle}>
            {editingIndex !== null ? 'Editar Passo' : 'Adicionar Passo'}
          </Text>

          {/* Descrição da instrução */}
          <TextInput
            mode="outlined"
            label="Descrição do passo"
            value={newInstruction.description}
            onChangeText={(text) => setNewInstruction(prev => ({...prev, description: text}))}
            placeholder="Ex: Em uma tigela, misture a farinha com o açúcar..."
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          {/* Duração e temperatura */}
          <View style={styles.metaRow}>
            <TextInput
              mode="outlined"
              label="Tempo (minutos)"
              value={newInstruction.duration}
              onChangeText={(text) => setNewInstruction(prev => ({...prev, duration: text}))}
              placeholder="Ex: 15"
              keyboardType="numeric"
              style={[styles.input, styles.metaInput]}
            />

            <TextInput
              mode="outlined"
              label="Temperatura (°C)"
              value={newInstruction.temperature}
              onChangeText={(text) => setNewInstruction(prev => ({...prev, temperature: text}))}
              placeholder="Ex: 180"
              keyboardType="numeric"
              style={[styles.input, styles.metaInput]}
            />
          </View>

          {/* Botões de ação */}
          <View style={styles.formActions}>
            {editingIndex !== null && (
              <Button
                mode="outlined"
                onPress={cancelEdit}
                style={styles.actionButton}>
                Cancelar
              </Button>
            )}
            <Button
              mode="contained"
              onPress={addInstruction}
              disabled={!newInstruction.description.trim()}
              style={styles.actionButton}>
              {editingIndex !== null ? 'Salvar' : 'Adicionar'}
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Lista de instruções */}
      {instructions.length > 0 && (
        <View style={styles.instructionsList}>
          <Text variant="titleSmall" style={styles.listTitle}>
            Passos Adicionados ({instructions.length})
          </Text>
          <FlatList
            data={instructions}
            renderItem={renderInstruction}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      )}

      {instructions.length === 0 && (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Nenhum passo adicionado ainda
            </Text>
            <Text variant="bodySmall" style={styles.emptySubtext}>
              Adicione os passos do modo de preparo da sua receita
            </Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
  },
  formCard: {
    marginBottom: 16,
    elevation: 2,
  },
  formTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: theme.colors.background,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaInput: {
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    minWidth: 100,
  },
  instructionsList: {
    marginTop: 8,
  },
  listTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionCard: {
    marginBottom: 12,
    elevation: 1,
  },
  instructionContent: {
    paddingVertical: 12,
  },
  instructionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  instructionMeta: {
    flexDirection: 'row',
    gap: 6,
  },
  metaChip: {
    height: 24,
  },
  instructionText: {
    lineHeight: 20,
    marginBottom: 12,
  },
  instructionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  emptyCard: {
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default InstructionInput;