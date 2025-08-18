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
  Checkbox,
  Divider,
  IconButton,
} from 'react-native-paper';
import {useAppDispatch, useAppSelector} from '@/store';
import {registerUser, socialLogin, clearError} from '@/store/slices/authSlice';
import {showToast} from '@/store/slices/uiSlice';
import {validateField, registerSchema} from '@/utils/validators';
import {SocialProvider} from '@/types/enums';
import {ScreenProps} from '@/types';

interface RegisterScreenProps extends ScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const {loading, error} = useAppSelector(state => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: '',
    acceptTerms: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = async (field: string, value: string | boolean) => {
    setFormData(prev => ({...prev, [field]: value}));

    // Validar campo em tempo real (apenas para campos de texto)
    if (typeof value === 'string') {
      const error = await validateField(registerSchema, field, value);
      setFieldErrors(prev => ({
        ...prev,
        [field]: error || '',
      }));
    }
  };

  const handleRegister = async () => {
    try {
      // Validar formulário completo
      await registerSchema.validate(formData, {abortEarly: false});

      const {confirmPassword, acceptTerms, ...registerData} = formData;

      const result = await dispatch(registerUser(registerData));

      if (registerUser.fulfilled.match(result)) {
        dispatch(
          showToast({
            message: 'Conta criada com sucesso! Verifique seu email.',
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
            message: 'Conta criada com sucesso via login social!',
            type: 'success',
          }),
        );
      }
    } catch (error) {
      dispatch(
        showToast({
          message: 'Erro no registro social. Tente novamente.',
          type: 'error',
        }),
      );
    }
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.username &&
      formData.displayName &&
      formData.acceptTerms &&
      Object.values(fieldErrors).every(error => !error)
    );
  };

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
            Criar conta
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Junte-se à nossa comunidade culinária
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Nome completo"
                value={formData.displayName}
                onChangeText={value => handleInputChange('displayName', value)}
                autoCapitalize="words"
                autoComplete="name"
                error={!!fieldErrors.displayName}
                disabled={loading}
                style={styles.input}
              />
              {fieldErrors.displayName && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {fieldErrors.displayName}
                </Text>
              )}

              <TextInput
                label="Nome de usuário"
                value={formData.username}
                onChangeText={value => handleInputChange('username', value)}
                autoCapitalize="none"
                autoComplete="username"
                error={!!fieldErrors.username}
                disabled={loading}
                style={styles.input}
              />
              {fieldErrors.username && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {fieldErrors.username}
                </Text>
              )}

              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={value => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={!!fieldErrors.email}
                disabled={loading}
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
                autoComplete="new-password"
                error={!!fieldErrors.password}
                disabled={loading}
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

              <TextInput
                label="Confirmar senha"
                value={formData.confirmPassword}
                onChangeText={value =>
                  handleInputChange('confirmPassword', value)
                }
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                error={!!fieldErrors.confirmPassword}
                disabled={loading}
                style={styles.input}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />
              {fieldErrors.confirmPassword && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {fieldErrors.confirmPassword}
                </Text>
              )}

              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={formData.acceptTerms ? 'checked' : 'unchecked'}
                  onPress={() =>
                    handleInputChange('acceptTerms', !formData.acceptTerms)
                  }
                  disabled={loading}
                />
                <Text variant="bodySmall" style={styles.checkboxText}>
                  Eu aceito os{' '}
                  <Text style={styles.linkText}>Termos de Uso</Text> e a{' '}
                  <Text style={styles.linkText}>Política de Privacidade</Text>
                </Text>
              </View>

              {fieldErrors.acceptTerms && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {fieldErrors.acceptTerms}
                </Text>
              )}

              {error && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {error}
                </Text>
              )}

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={!isFormValid()}
                style={styles.registerButton}>
                Criar conta
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.dividerContainer}>
            <Divider style={styles.divider} />
            <Text variant="bodySmall" style={styles.dividerText}>
              ou cadastre-se com
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

          <View style={styles.loginContainer}>
            <Text variant="bodyMedium">Já tem uma conta? </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              compact>
              Entrar
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkboxText: {
    flex: 1,
    marginLeft: 8,
  },
  linkText: {
    color: '#FF6B35',
    textDecorationLine: 'underline',
  },
  registerButton: {
    marginTop: 16,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RegisterScreen;
