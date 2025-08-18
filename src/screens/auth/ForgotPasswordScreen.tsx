import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {TextInput, Button, Text, Card, IconButton} from 'react-native-paper';
import {useAppDispatch, useAppSelector} from '@/store';
import {showToast} from '@/store/slices/uiSlice';
import {useRequestPasswordResetMutation} from '@/services/authApi';
import {validateField} from '@/utils/validators';
import * as yup from 'yup';
import {ScreenProps} from '@/types';

interface ForgotPasswordScreenProps extends ScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

const emailSchema = yup.object({
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
});

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const [requestPasswordReset, {isLoading}] = useRequestPasswordResetMutation();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailChange = async (value: string) => {
    setEmail(value);

    // Validar email em tempo real
    const error = await validateField(emailSchema, 'email', value);
    setEmailError(error || '');
  };

  const handleSendReset = async () => {
    try {
      // Validar email
      await emailSchema.validate({email});

      await requestPasswordReset({email}).unwrap();

      setEmailSent(true);
      dispatch(
        showToast({
          message: 'Email de recuperação enviado com sucesso!',
          type: 'success',
        }),
      );
    } catch (error: any) {
      if (error.inner) {
        const validationError = error.inner[0];
        setEmailError(validationError.message);
      } else {
        dispatch(
          showToast({
            message:
              error.data?.error?.message ||
              'Erro ao enviar email de recuperação',
            type: 'error',
          }),
        );
      }
    }
  };

  const handleResendEmail = async () => {
    setEmailSent(false);
    await handleSendReset();
  };

  const isFormValid = () => {
    return email && !emailError;
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <IconButton
              icon="email-check"
              size={64}
              iconColor="#4caf50"
              style={styles.successIcon}
            />

            <Text variant="headlineSmall" style={styles.successTitle}>
              Email enviado!
            </Text>

            <Text variant="bodyMedium" style={styles.successMessage}>
              Enviamos um link de recuperação para{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>

            <Text variant="bodySmall" style={styles.instructionText}>
              Verifique sua caixa de entrada e spam. O link expira em 1 hora.
            </Text>

            <Button
              mode="contained"
              onPress={handleResendEmail}
              loading={isLoading}
              style={styles.resendButton}>
              Reenviar email
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.backButton}>
              Voltar ao login
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backIcon}
          />

          <Text variant="headlineMedium" style={styles.title}>
            Esqueceu a senha?
          </Text>

          <Text variant="bodyMedium" style={styles.subtitle}>
            Digite seu email e enviaremos um link para redefinir sua senha
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Email"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={!!emailError}
                disabled={isLoading}
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />
              {emailError && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {emailError}
                </Text>
              )}

              <Button
                mode="contained"
                onPress={handleSendReset}
                loading={isLoading}
                disabled={!isFormValid()}
                style={styles.sendButton}>
                Enviar link de recuperação
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.helpContainer}>
            <Text variant="bodySmall" style={styles.helpText}>
              Lembrou da senha?{' '}
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              compact>
              Fazer login
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
  backIcon: {
    alignSelf: 'flex-start',
    marginBottom: 16,
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
    lineHeight: 22,
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
  sendButton: {
    marginTop: 16,
  },
  helpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    opacity: 0.7,
  },
  // Success screen styles
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  successMessage: {
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  instructionText: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
    lineHeight: 20,
  },
  resendButton: {
    marginBottom: 16,
    minWidth: 200,
  },
  backButton: {
    minWidth: 200,
  },
});

export default ForgotPasswordScreen;
