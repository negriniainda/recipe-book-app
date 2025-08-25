import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useAccessibilitySettings, useKeyboardNavigation } from '../../hooks/useAccessibility';

interface FocusableElement {
  id: string;
  ref: React.RefObject<any>;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  tabIndex?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
}

interface KeyboardNavigationContextType {
  registerElement: (element: FocusableElement) => void;
  unregisterElement: (id: string) => void;
  focusElement: (id: string) => void;
  currentFocus: string | null;
  isKeyboardNavigationActive: boolean;
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | null>(null);

export const useKeyboardNavigationContext = () => {
  const context = useContext(KeyboardNavigationContext);
  if (!context) {
    throw new Error('useKeyboardNavigationContext must be used within KeyboardNavigationProvider');
  }
  return context;
};

interface KeyboardNavigationProviderProps {
  children: React.ReactNode;
}

export const KeyboardNavigationProvider: React.FC<KeyboardNavigationProviderProps> = ({
  children,
}) => {
  const [elements, setElements] = useState<Map<string, FocusableElement>>(new Map());
  const [currentFocus, setCurrentFocus] = useState<string | null>(null);
  const [isKeyboardNavigationActive, setIsKeyboardNavigationActive] = useState(false);

  const { settings } = useAccessibilitySettings();
  const { handleKeyPress } = useKeyboardNavigation();

  useEffect(() => {
    setIsKeyboardNavigationActive(settings?.keyboardNavigation || false);
  }, [settings]);

  const registerElement = useCallback((element: FocusableElement) => {
    setElements(prev => {
      const newElements = new Map(prev);
      newElements.set(element.id, element);
      return newElements;
    });
  }, []);

  const unregisterElement = useCallback((id: string) => {
    setElements(prev => {
      const newElements = new Map(prev);
      newElements.delete(id);
      return newElements;
    });
    
    if (currentFocus === id) {
      setCurrentFocus(null);
    }
  }, [currentFocus]);

  const focusElement = useCallback((id: string) => {
    const element = elements.get(id);
    if (element && !element.disabled && element.ref.current) {
      setCurrentFocus(id);
      
      // Focar o elemento nativo
      if (element.ref.current.focus) {
        element.ref.current.focus();
      }
      
      // Anunciar para leitores de tela
      if (settings?.announceNavigation && element.accessibilityLabel) {
        // AccessibilityInfo.announceForAccessibility seria usado aqui
        console.log(`Focado: ${element.accessibilityLabel}`);
      }
    }
  }, [elements, settings]);

  const getNextElement = useCallback((direction: 'next' | 'previous' | 'up' | 'down') => {
    if (elements.size === 0) return null;

    const elementsArray = Array.from(elements.values())
      .filter(el => !el.disabled)
      .sort((a, b) => {
        // Ordenar por posição na tela
        if (direction === 'next' || direction === 'previous') {
          // Ordenar por tabIndex primeiro, depois por posição vertical e horizontal
          const tabIndexDiff = (a.tabIndex || 0) - (b.tabIndex || 0);
          if (tabIndexDiff !== 0) return tabIndexDiff;
          
          const yDiff = a.bounds.y - b.bounds.y;
          if (Math.abs(yDiff) > 10) return yDiff; // Tolerância para elementos na mesma linha
          
          return a.bounds.x - b.bounds.x;
        } else {
          // Para up/down, ordenar por posição vertical primeiro
          const yDiff = a.bounds.y - b.bounds.y;
          if (Math.abs(yDiff) > 10) return yDiff;
          
          return a.bounds.x - b.bounds.x;
        }
      });

    if (elementsArray.length === 0) return null;

    const currentIndex = currentFocus 
      ? elementsArray.findIndex(el => el.id === currentFocus)
      : -1;

    switch (direction) {
      case 'next':
        return elementsArray[(currentIndex + 1) % elementsArray.length];
      
      case 'previous':
        return elementsArray[currentIndex <= 0 ? elementsArray.length - 1 : currentIndex - 1];
      
      case 'up':
        return findElementInDirection(elementsArray, currentIndex, 'up');
      
      case 'down':
        return findElementInDirection(elementsArray, currentIndex, 'down');
      
      default:
        return null;
    }
  }, [elements, currentFocus]);

  const findElementInDirection = (
    elementsArray: FocusableElement[],
    currentIndex: number,
    direction: 'up' | 'down'
  ): FocusableElement | null => {
    if (currentIndex < 0 || currentIndex >= elementsArray.length) return null;

    const currentElement = elementsArray[currentIndex];
    const currentY = currentElement.bounds.y + currentElement.bounds.height / 2;
    const currentX = currentElement.bounds.x + currentElement.bounds.width / 2;

    let bestElement: FocusableElement | null = null;
    let bestDistance = Infinity;

    for (const element of elementsArray) {
      if (element.id === currentElement.id) continue;

      const elementY = element.bounds.y + element.bounds.height / 2;
      const elementX = element.bounds.x + element.bounds.width / 2;

      const isInDirection = direction === 'up' ? elementY < currentY : elementY > currentY;
      if (!isInDirection) continue;

      // Calcular distância (priorizando elementos mais próximos horizontalmente)
      const verticalDistance = Math.abs(elementY - currentY);
      const horizontalDistance = Math.abs(elementX - currentX);
      const distance = verticalDistance + (horizontalDistance * 0.5);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestElement = element;
      }
    }

    return bestElement;
  };

  const handleKeyboardNavigation = useCallback((key: string) => {
    if (!isKeyboardNavigationActive) return;

    let nextElement: FocusableElement | null = null;

    switch (key) {
      case 'Tab':
        nextElement = getNextElement('next');
        break;
      case 'Shift+Tab':
        nextElement = getNextElement('previous');
        break;
      case 'ArrowUp':
        nextElement = getNextElement('up');
        break;
      case 'ArrowDown':
        nextElement = getNextElement('down');
        break;
      case 'Enter':
      case 'Space':
        // Ativar elemento atual
        const currentElement = currentFocus ? elements.get(currentFocus) : null;
        if (currentElement?.ref.current) {
          if (currentElement.ref.current.onPress) {
            currentElement.ref.current.onPress();
          } else if (currentElement.ref.current.props?.onPress) {
            currentElement.ref.current.props.onPress();
          }
        }
        return;
      case 'Escape':
        // Limpar foco
        setCurrentFocus(null);
        return;
    }

    if (nextElement) {
      focusElement(nextElement.id);
    }
  }, [isKeyboardNavigationActive, getNextElement, focusElement, currentFocus, elements]);

  // Registrar listener de teclado global
  useEffect(() => {
    if (!isKeyboardNavigationActive) return;

    // Em uma implementação real, registraria listeners de teclado aqui
    // Por enquanto, apenas simular
    const handleKeyDown = (event: any) => {
      const key = event.key;
      const isShift = event.shiftKey;
      
      let keyString = key;
      if (isShift && key === 'Tab') {
        keyString = 'Shift+Tab';
      }
      
      handleKeyboardNavigation(keyString);
    };

    // Simular registro de evento
    console.log('Keyboard navigation listeners registered');

    return () => {
      console.log('Keyboard navigation listeners removed');
    };
  }, [isKeyboardNavigationActive, handleKeyboardNavigation]);

  const contextValue: KeyboardNavigationContextType = {
    registerElement,
    unregisterElement,
    focusElement,
    currentFocus,
    isKeyboardNavigationActive,
  };

  return (
    <KeyboardNavigationContext.Provider value={contextValue}>
      <View style={styles.container}>
        {children}
        {/* Indicador visual de foco */}
        {isKeyboardNavigationActive && currentFocus && settings?.focusIndicator && (
          <FocusIndicator elementId={currentFocus} elements={elements} />
        )}
      </View>
    </KeyboardNavigationContext.Provider>
  );
};

interface FocusIndicatorProps {
  elementId: string;
  elements: Map<string, FocusableElement>;
}

const FocusIndicator: React.FC<FocusIndicatorProps> = ({ elementId, elements }) => {
  const element = elements.get(elementId);
  
  if (!element) return null;

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  return (
    <View
      style={[
        styles.focusIndicator,
        {
          left: element.bounds.x - 2,
          top: element.bounds.y - 2,
          width: element.bounds.width + 4,
          height: element.bounds.height + 4,
        },
      ]}
      pointerEvents="none"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  focusIndicator: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#2196f3',
    borderRadius: 4,
    backgroundColor: 'transparent',
    zIndex: 9999,
  },
});

// Hook para componentes registrarem-se para navegação por teclado
export const useFocusableElement = (
  id: string,
  ref: React.RefObject<any>,
  options: {
    tabIndex?: number;
    disabled?: boolean;
    accessibilityLabel?: string;
    bounds?: { x: number; y: number; width: number; height: number };
  } = {}
) => {
  const { registerElement, unregisterElement, currentFocus } = useKeyboardNavigationContext();
  const [bounds, setBounds] = useState(options.bounds || { x: 0, y: 0, width: 0, height: 0 });

  const isFocused = currentFocus === id;

  const measureElement = useCallback(() => {
    if (ref.current && ref.current.measure) {
      ref.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setBounds({ x: pageX, y: pageY, width, height });
      });
    }
  }, [ref]);

  useEffect(() => {
    const element: FocusableElement = {
      id,
      ref,
      bounds,
      tabIndex: options.tabIndex,
      disabled: options.disabled,
      accessibilityLabel: options.accessibilityLabel,
    };

    registerElement(element);
    measureElement();

    return () => {
      unregisterElement(id);
    };
  }, [id, ref, bounds, options.tabIndex, options.disabled, options.accessibilityLabel, registerElement, unregisterElement, measureElement]);

  // Re-medir quando o layout mudar
  useEffect(() => {
    const timer = setTimeout(measureElement, 100);
    return () => clearTimeout(timer);
  }, [measureElement]);

  return {
    isFocused,
    measureElement,
  };
};

export default KeyboardNavigationProvider;