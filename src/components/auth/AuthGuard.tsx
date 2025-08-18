import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {useAppSelector} from '@/store';
import {theme} from '@/utils/theme';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  requireAuth = true,
}) => {
  const {isAuthenticated, loading, user} = useAppSelector(state => state.auth);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Verificando autenticação...
        </Text>
      </View>
    );
  }

  // Se requer autenticação mas usuário não está autenticado
  if (requireAuth && !isAuthenticated) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <View style={styles.unauthenticatedContainer}>
        <Text variant="headlineSmall" style={styles.unauthenticatedTitle}>
          Acesso restrito
        </Text>
        <Text variant="bodyMedium" style={styles.unauthenticatedMessage}>
          Você precisa estar logado para acessar esta funcionalidade.
        </Text>
      </View>
    );
  }

  // Se não requer autenticação mas usuário está autenticado
  if (!requireAuth && isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  // Verificar se o usuário precisa completar o perfil
  if (isAuthenticated && user && !user.preferences) {
    return (
      <View style={styles.incompleteProfileContainer}>
        <Text variant="headlineSmall" style={styles.incompleteProfileTitle}>
          Complete seu perfil
        </Text>
        <Text variant="bodyMedium" style={styles.incompleteProfileMessage}>
          Para continuar, você precisa completar as informações do seu perfil.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
    <Text variant="bodyMedium" style={styles.loadingText}>
      Carregando...
    </Text>
  </View>
);

const UnauthenticatedScreen: React.FC<{message?: string}> = ({
  message = 'Você precisa estar logado para acessar esta funcionalidade.',
}) => (
  <View style={styles.unauthenticatedContainer}>
    <Text variant="headlineSmall" style={styles.unauthenticatedTitle}>
      Acesso restrito
    </Text>
    <Text variant="bodyMedium" style={styles.unauthenticatedMessage}>
      {message}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  unauthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 32,
  },
  unauthenticatedTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  unauthenticatedMessage: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  incompleteProfileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 32,
  },
  incompleteProfileTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  incompleteProfileMessage: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
});

export {LoadingScreen, UnauthenticatedScreen};
export default AuthGuard;
