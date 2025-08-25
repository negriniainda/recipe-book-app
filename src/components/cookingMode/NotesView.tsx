import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {CookingSession} from '../../types/cookingMode';
import {colors, typography, spacing} from '../../theme';

interface NotesViewProps {
  session: CookingSession;
  onAddNote: (note: string) => void;
  onUpdateNote: (noteId: string, content: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  session,
  onAddNote,
  onUpdateNote,
}) => {
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notas da Sessão</Text>
        <Text style={styles.subtitle}>
          Adicione observações sobre o preparo
        </Text>
      </View>

      <View style={styles.addNoteSection}>
        <TextInput
          style={styles.noteInput}
          value={newNote}
          onChangeText={setNewNote}
          placeholder="Adicionar uma nota..."
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddNote}
          disabled={!newNote.trim()}
        >
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.notesList}>
        {session.notes.map((note, index) => (
          <View key={index} style={styles.noteItem}>
            <Text style={styles.noteText}>{note}</Text>
            <Text style={styles.noteTime}>
              {new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    ...typography.title,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[600],
  },
  addNoteSection: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    minHeight: 80,
    ...typography.body,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  addButtonText: {
    ...typography.button,
    color: colors.white,
  },
  notesList: {
    flex: 1,
    padding: spacing.md,
  },
  noteItem: {
    backgroundColor: colors.white,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  noteText: {
    ...typography.body,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  noteTime: {
    ...typography.caption,
    color: colors.gray[500],
  },
});