import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {ShoppingListItem as ShoppingListItemType} from '../../types/shoppingList';
import {colors, typography, spacing} from '../../theme';

interface ShoppingListItemProps {
  item: ShoppingListItemType;
  isSelected: boolean;
  isEditing: boolean;
  showPrices: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export const ShoppingListItem: React.FC<ShoppingListItemProps> = ({
  item,
  isSelected,
  isEditing,
  showPrices,
  onPress,
  onLongPress,
}) => {
  const isPurchased = item.status === 'purchased';
  const isUnavailable = item.status === 'unavailable';

  const getStatusIcon = () => {
    if (isPurchased) return 'checkmark-circle';
    if (isUnavailable) return 'close-circle';
    return 'ellipse-outline';
  };

  const getStatusColor = () => {
    if (isPurchased) return colors.success[500];
    if (isUnavailable) return colors.error[500];
    return colors.gray[400];
  };

  const formatPrice = (price?: number) => {
    if (!price) return '';
    return `R$ ${price.toFixed(2)}`;
  };

  const formatQuantity = () => {
    return `${item.quantity} ${item.unit}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isPurchased && styles.purchasedContainer,
        isUnavailable && styles.unavailableContainer,
        isSelected && styles.selectedContainer,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        {isEditing ? (
          <View style={styles.checkbox}>
            <Ionicons
              name={isSelected ? 'checkbox' : 'square-outline'}
              size={24}
              color={isSelected ? colors.primary[500] : colors.gray[400]}
            />
          </View>
        ) : (
          <View style={styles.statusIcon}>
            <Ionicons
              name={getStatusIcon()}
              size={24}
              color={getStatusColor()}
            />
          </View>
        )}

        <View style={styles.itemInfo}>
          <Text
            style={[
              styles.itemName,
              isPurchased && styles.purchasedText,
              isUnavailable && styles.unavailableText,
            ]}
          >
            {item.name}
          </Text>
          
          <View style={styles.itemDetails}>
            <Text style={styles.quantity}>
              {formatQuantity()}
            </Text>
            
            {item.notes && (
              <Text style={styles.notes} numberOfLines={1}>
                • {item.notes}
              </Text>
            )}
          </View>

          {item.recipeIds.length > 0 && (
            <View style={styles.recipeIndicator}>
              <Ionicons name="restaurant-outline" size={12} color={colors.gray[500]} />
              <Text style={styles.recipeCount}>
                {item.recipeIds.length} receita{item.recipeIds.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {showPrices && (
          <View style={styles.priceSection}>
            {item.actualPrice ? (
              <Text style={styles.actualPrice}>
                {formatPrice(item.actualPrice)}
              </Text>
            ) : item.estimatedPrice ? (
              <Text style={styles.estimatedPrice}>
                ~{formatPrice(item.estimatedPrice)}
              </Text>
            ) : null}
          </View>
        )}

        {!isEditing && (
          <View style={styles.actionIndicator}>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.gray[400]}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  purchasedContainer: {
    backgroundColor: colors.success[50],
    borderColor: colors.success[200],
  },
  unavailableContainer: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[200],
  },
  selectedContainer: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
    borderWidth: 2,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: spacing.md,
  },
  checkbox: {
    marginRight: spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.subtitle,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  purchasedText: {
    textDecorationLine: 'line-through',
    color: colors.gray[500],
  },
  unavailableText: {
    color: colors.error[600],
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quantity: {
    ...typography.caption,
    color: colors.gray[600],
    fontWeight: '500',
  },
  notes: {
    ...typography.caption,
    color: colors.gray[500],
    marginLeft: spacing.sm,
    flex: 1,
  },
  recipeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeCount: {
    ...typography.caption,
    color: colors.gray[500],
    marginLeft: spacing.xs,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  priceSection: {
    marginBottom: spacing.xs,
  },
  actualPrice: {
    ...typography.caption,
    color: colors.success[600],
    fontWeight: '600',
  },
  estimatedPrice: {
    ...typography.caption,
    color: colors.gray[500],
    fontStyle: 'italic',
  },
  actionIndicator: {
    opacity: 0.5,
  },
});