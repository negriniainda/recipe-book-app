import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {GroceryCategory} from '../../types/shoppingList';
import {categorizeIngredient, suggestUnit, estimatePrice} from '../../utils/ingredientCategorizer';
import {colors, typography, spacing} from '../../theme';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (
    name: string,
    quantity: number,
    unit: string,
    category: GroceryCategory,
    estimatedPrice?: number
  ) => void;
}

const CATEGORY_OPTIONS: {key: GroceryCategory; label: string; icon: string}[] = [
  {key: 'produce', label: 'Frutas e Vegetais', icon: 'leaf'},
  {key: 'meat', label: 'Carnes e Peixes', icon: 'fish'},
  {key: 'dairy', label: 'Laticínios', icon: 'water'},
  {key: 'bakery', label: 'Padaria', icon: 'cafe'},
  {key: 'pantry', label: 'Despensa', icon: 'archive'},
  {key: 'frozen', label: 'Congelados', icon: 'snow'},
  {key: 'beverages', label: 'Bebidas', icon: 'wine'},
  {key: 'snacks', label: 'Lanches', icon: 'fast-food'},
  {key: 'condiments', label: 'Condimentos', icon: 'flask'},
  {key: 'spices', label: 'Temperos', icon: 'flower'},
  {key: 'cleaning', label: 'Limpeza', icon: 'brush'},
  {key: 'other', label: 'Outros', icon: 'ellipsis-horizontal'},
];

const UNIT_OPTIONS = [
  'unidade',
  'kg',
  'g',
  'litro',
  'ml',
  'pacote',
  'caixa',
  'lata',
  'garrafa',
  'saco',
];

export const AddItemModal: React.FC<AddItemModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('unidade');
  const [category, setCategory] = useState<GroceryCategory>('other');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [autoSuggestionsEnabled, setAutoSuggestionsEnabled] = useState(true);

  const nameInputRef = useRef<TextInput>(null);

  const resetForm = () => {
    setName('');
    setQuantity('1');
    setUnit('unidade');
    setCategory('other');
    setEstimatedPrice('');
    setNotes('');
    setShowUnitPicker(false);
    setShowCategoryPicker(false);
    setAutoSuggestionsEnabled(true);
  };

  // Auto-suggest when name changes
  const handleNameChange = (newName: string) => {
    setName(newName);
    
    if (autoSuggestionsEnabled && newName.trim().length > 2) {
      // Auto-suggest category
      const suggestedCategory = categorizeIngredient(newName);
      if (suggestedCategory !== 'other') {
        setCategory(suggestedCategory);
      }
      
      // Auto-suggest unit
      const suggestedUnit = suggestUnit(newName);
      setUnit(suggestedUnit);
      
      // Auto-estimate price
      const quantityNum = parseFloat(quantity) || 1;
      const estimatedPriceNum = estimatePrice(newName, quantityNum, suggestedUnit);
      if (estimatedPriceNum > 0) {
        setEstimatedPrice(estimatedPriceNum.toFixed(2));
      }
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAdd = () => {
    if (!name.trim()) return;

    const quantityNum = parseFloat(quantity) || 1;
    const priceNum = estimatedPrice ? parseFloat(estimatedPrice) : undefined;

    onAdd(name.trim(), quantityNum, unit, category, priceNum);
    resetForm();
  };

  const getCategoryLabel = () => {
    return CATEGORY_OPTIONS.find(opt => opt.key === category)?.label || 'Outros';
  };

  const getCategoryIcon = () => {
    return CATEGORY_OPTIONS.find(opt => opt.key === category)?.icon || 'ellipsis-horizontal';
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
          
          <Text style={styles.title}>Adicionar Item</Text>
          
          <TouchableOpacity
            onPress={handleAdd}
            disabled={!name.trim()}
            style={[
              styles.addButton,
              !name.trim() && styles.addButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.addButtonText,
                !name.trim() && styles.addButtonTextDisabled,
              ]}
            >
              Adicionar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Item Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Nome do Item *</Text>
            <TextInput
              ref={nameInputRef}
              style={styles.textInput}
              value={name}
              onChangeText={handleNameChange}
              placeholder="Ex: Tomate, Leite, Pão..."
              autoFocus
              returnKeyType="next"
            />
            
            {autoSuggestionsEnabled && name.trim().length > 0 && (
              <TouchableOpacity
                style={styles.autoSuggestToggle}
                onPress={() => setAutoSuggestionsEnabled(!autoSuggestionsEnabled)}
              >
                <Ionicons 
                  name={autoSuggestionsEnabled ? "bulb" : "bulb-outline"} 
                  size={16} 
                  color={colors.primary[600]} 
                />
                <Text style={styles.autoSuggestText}>
                  Sugestões automáticas {autoSuggestionsEnabled ? 'ativadas' : 'desativadas'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quantity and Unit */}
          <View style={styles.row}>
            <View style={[styles.section, {flex: 1, marginRight: spacing.md}]}>
              <Text style={styles.label}>Quantidade</Text>
              <TextInput
                style={styles.textInput}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="1"
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>

            <View style={[styles.section, {flex: 1}]}>
              <Text style={styles.label}>Unidade</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowUnitPicker(true)}
              >
                <Text style={styles.pickerText}>{unit}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Categoria</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowCategoryPicker(true)}
            >
              <View style={styles.categoryDisplay}>
                <Ionicons 
                  name={getCategoryIcon() as any} 
                  size={20} 
                  color={colors.gray[600]} 
                />
                <Text style={styles.pickerText}>{getCategoryLabel()}</Text>
              </View>
              <Ionicons name="chevron-down" size={16} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          {/* Estimated Price */}
          <View style={styles.section}>
            <Text style={styles.label}>Preço Estimado (opcional)</Text>
            <View style={styles.priceInput}>
              <Text style={styles.currencySymbol}>R$</Text>
              <TextInput
                style={styles.priceTextInput}
                value={estimatedPrice}
                onChangeText={setEstimatedPrice}
                placeholder="0,00"
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Observações (opcional)</Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ex: Marca específica, tamanho..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Unit Picker Modal */}
        <Modal
          visible={showUnitPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowUnitPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowUnitPicker(false)}
          >
            <View style={styles.pickerModal}>
              <Text style={styles.pickerTitle}>Selecionar Unidade</Text>
              <ScrollView>
                {UNIT_OPTIONS.map(unitOption => (
                  <TouchableOpacity
                    key={unitOption}
                    style={styles.pickerOption}
                    onPress={() => {
                      setUnit(unitOption);
                      setShowUnitPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{unitOption}</Text>
                    {unit === unitOption && (
                      <Ionicons name="checkmark" size={16} color={colors.primary[600]} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Category Picker Modal */}
        <Modal
          visible={showCategoryPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowCategoryPicker(false)}
          >
            <View style={styles.pickerModal}>
              <Text style={styles.pickerTitle}>Selecionar Categoria</Text>
              <ScrollView>
                {CATEGORY_OPTIONS.map(categoryOption => (
                  <TouchableOpacity
                    key={categoryOption.key}
                    style={styles.pickerOption}
                    onPress={() => {
                      setCategory(categoryOption.key);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <View style={styles.categoryOption}>
                      <Ionicons 
                        name={categoryOption.icon as any} 
                        size={20} 
                        color={colors.gray[600]} 
                      />
                      <Text style={styles.pickerOptionText}>{categoryOption.label}</Text>
                    </View>
                    {category === categoryOption.key && (
                      <Ionicons name="checkmark" size={16} color={colors.primary[600]} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
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
  addButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary[500],
    borderRadius: 6,
  },
  addButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  addButtonText: {
    ...typography.button,
    color: colors.white,
  },
  addButtonTextDisabled: {
    color: colors.gray[500],
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
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
  notesInput: {
    height: 80,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  pickerText: {
    ...typography.body,
    color: colors.gray[900],
  },
  categoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  currencySymbol: {
    ...typography.body,
    color: colors.gray[600],
    paddingLeft: spacing.md,
  },
  priceTextInput: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.gray[900],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    margin: spacing.xl,
    maxHeight: '70%',
    minWidth: 280,
  },
  pickerTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  pickerOptionText: {
    ...typography.body,
    color: colors.gray[700],
    marginLeft: spacing.sm,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  autoSuggestToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  autoSuggestText: {
    ...typography.caption,
    color: colors.primary[600],
    marginLeft: spacing.xs,
    fontStyle: 'italic',
  },
});