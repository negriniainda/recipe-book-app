import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Divider,
  IconButton,
} from 'react-native-paper';
import {useAppDispatch, useAppSelector} from '@/store';
import {loginUser, socialLogin, clearError} from '@/store/slices/authSlice';
import {showToast} from '@/store/slices/uiSlice';
import {validateField, loginSchema} from '@/utils/validators';
import {SocialProvider} from '@/types/enums';
import {ScreenProps} from '@/types';

interface LoginScreenProps extends ScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const {loading, error, loginAttempts} = useAppSelector(state => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = async (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));

    // Validar campo em tempo real
    const error = await validateField(loginSchema, field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: error || '',
    }));
  };

  const handleLogin = async () => {
    try {
      // Validar formulário completo
      await loginSchema.validate(formData, {abortEarly: false});

      const result = await dispatch(loginUser(formData));

      if (loginUser.fulfilled.match(result)) {
        dispatch(
          showToast({
            message: 'Login realizado com sucesso!',
            type: 'success',
          }),
        );
        // Navegação será tratada pelo middleware de autenticação
      }
    } catch (validationError: any) {
      if (validationError.inner) {
        const errors: Record<string, string> = {};
        validationError.inner.forEach((err: any) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        setFieldErrors(errors);
      }
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      // Aqui seria integrado com o SDK do provedor social
      // Por enquanto, simular o token
      const mockToken = `mock_${provider}_token`;

      const result = await dispatch(
        socialLogin({
          provider,
          token: mockToken,
          email: `user@${provider}.com`,
          name: 'Usuário Teste',
        }),
      );

      if (socialLogin.fulfilled.match(result)) {
        dispatch(
          showToast({
            message: 'Login social realizado com sucesso!',
            type: 'success',
          }),
        );
      }
    } catch (error) {
      dispatch(
        showToast({
          message: 'Erro no login social. Tente novamente.',
          type: 'error',
        }),
      );
    }
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.password &&
      Object.values(fieldErrors).every(error => !error)
    );
  };

  const isBlocked = loginAttempts >= 5;

  React.useEffect(() => {
    // Limpar erro quando componente montar
    dispatch(clearError());
  }, [dispatch]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Bem-vindo de volta!
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Entre na sua conta para continuar
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={value => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={!!fieldErrors.email}
                disabled={loading || isBlocked}
                style={styles.input}
              />
              {fieldErrors.email && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {fieldErrors.email}
                </Text>
              )}

              <TextInput
                label="Senha"
                value={formData.password}
                onChangeText={value => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoComplete="password"
                error={!!fieldErrors.password}
                disabled={loading || isBlocked}
                style={styles.input}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              {fieldErrors.password && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {fieldErrors.password}
                </Text>
              )}

              {error && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {error}
                </Text>
              )}

              {isBlocked && (
                <Text variant="bodySmall" style={styles.warningText}>
                  Muitas tentativas de login. Tente novamente em alguns minutos.
                </Text>
              )}

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={!isFormValid() || isBlocked}
                style={styles.loginButton}>
                Entrar
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotButton}>
                Esqueci minha senha
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.dividerContainer}>
            <Divider style={styles.divider} />
            <Text variant="bodySmall" style={styles.dividerText}>
              ou continue com
            </Text>
            <Divider style={styles.divider} />
          </View>

          <View style={styles.socialContainer}>
            <IconButton
              icon="google"
              mode="contained-tonal"
              size={24}
              onPress={() => handleSocialLogin(SocialProvider.GOOGLE)}
              disabled={loading}
              style={styles.socialButton}
            />
            <IconButton
              icon="apple"
              mode="contained-tonal"
              size={24}
              onPress={() => handleSocialLogin(SocialProvider.APPLE)}
              disabled={loading}
              style={styles.socialButton}
            />
            <IconButton
              icon="facebook"
              mode="contained-tonal"
              size={24}
              onPress={() => handleSocialLogin(SocialProvider.FACEBOOK)}
              disabled={loading}
              style={styles.socialButton}
            />
          </View>

          <View style={styles.registerContainer}>
            <Text variant="bodyMedium">Não tem uma conta? </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              compact>
              Cadastre-se
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  card: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 8,
  },
  warningText: {
    color: '#f57c00',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  forgotButton: {
    alignSelf: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    opacity: 0.6,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  socialButton: {
    marginHorizontal: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
