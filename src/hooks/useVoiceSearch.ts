import {useState, useCallback, useEffect} from 'react';
import {Alert, Platform} from 'react-native';

// Tipos para o React Native Voice (será instalado posteriormente)
interface VoiceSearchResult {
  value: string[];
}

interface VoiceSearchError {
  error: {
    code: string;
    message: string;
  };
}

interface UseVoiceSearchReturn {
  isListening: boolean;
  isAvailable: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  results: string[];
  error: string | null;
  clearResults: () => void;
}

export const useVoiceSearch = (): UseVoiceSearchReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Simular disponibilidade do Voice (será substituído pela implementação real)
  useEffect(() => {
    // Por enquanto, simular que está disponível apenas no Android/iOS
    setIsAvailable(Platform.OS === 'android' || Platform.OS === 'ios');
  }, []);

  const startListening = useCallback(async () => {
    if (!isAvailable) {
      Alert.alert(
        'Busca por Voz Indisponível',
        'A busca por voz não está disponível neste dispositivo.',
      );
      return;
    }

    try {
      setError(null);
      setResults([]);
      setIsListening(true);

      // TODO: Implementar com React Native Voice
      // await Voice.start('pt-BR');
      
      // Simulação para desenvolvimento
      setTimeout(() => {
        setResults(['receita de bolo de chocolate']);
        setIsListening(false);
      }, 2000);

    } catch (err) {
      setError('Erro ao iniciar busca por voz');
      setIsListening(false);
      console.error('Voice search error:', err);
    }
  }, [isAvailable]);

  const stopListening = useCallback(async () => {
    try {
      setIsListening(false);
      // TODO: Implementar com React Native Voice
      // await Voice.stop();
    } catch (err) {
      setError('Erro ao parar busca por voz');
      console.error('Voice search stop error:', err);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);

  return {
    isListening,
    isAvailable,
    startListening,
    stopListening,
    results,
    error,
    clearResults,
  };
};

export default useVoiceSearch;