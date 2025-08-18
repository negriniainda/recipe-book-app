// Constantes de autenticação
export const AUTH_CONSTANTS = {
  // Tempo de expiração do token (em milissegundos)
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutos

  // Máximo de tentativas de login
  MAX_LOGIN_ATTEMPTS: 5,

  // Tempo de bloqueio após muitas tentativas (em milissegundos)
  LOGIN_BLOCK_DURATION: 15 * 60 * 1000, // 15 minutos

  // Tempo de expiração do link de reset de senha (em milissegundos)
  PASSWORD_RESET_EXPIRY: 60 * 60 * 1000, // 1 hora

  // Configurações de senha
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },

  // Configurações de username
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  USERNAME_PATTERN: /^[a-zA-Z0-9_]+$/,

  // Configurações de nome
  DISPLAY_NAME_MIN_LENGTH: 2,
  DISPLAY_NAME_MAX_LENGTH: 50,

  // Configurações de bio
  BIO_MAX_LENGTH: 200,

  // URLs de termos e políticas
  TERMS_OF_SERVICE_URL: 'https://recipeapp.com/terms',
  PRIVACY_POLICY_URL: 'https://recipeapp.com/privacy',

  // Configurações de social login
  SOCIAL_PROVIDERS: {
    GOOGLE: {
      name: 'Google',
      icon: 'google',
      color: '#4285F4',
    },
    APPLE: {
      name: 'Apple',
      icon: 'apple',
      color: '#000000',
    },
    FACEBOOK: {
      name: 'Facebook',
      icon: 'facebook',
      color: '#1877F2',
    },
  },

  // Mensagens de erro personalizadas
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'Email ou senha incorretos',
    ACCOUNT_LOCKED: 'Conta bloqueada temporariamente',
    EMAIL_NOT_VERIFIED: 'Verifique seu email antes de fazer login',
    TOKEN_EXPIRED: 'Sessão expirada. Faça login novamente',
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
    WEAK_PASSWORD:
      'Senha deve ter pelo menos 8 caracteres com letras maiúsculas, minúsculas e números',
    EMAIL_ALREADY_EXISTS: 'Este email já está em uso',
    USERNAME_ALREADY_EXISTS: 'Este nome de usuário já está em uso',
    INVALID_EMAIL: 'Email inválido',
    PASSWORDS_DONT_MATCH: 'As senhas não coincidem',
    TERMS_NOT_ACCEPTED: 'Você deve aceitar os termos de uso',
  },

  // Mensagens de sucesso
  SUCCESS_MESSAGES: {
    LOGIN_SUCCESS: 'Login realizado com sucesso!',
    REGISTER_SUCCESS: 'Conta criada com sucesso! Verifique seu email.',
    LOGOUT_SUCCESS: 'Logout realizado com sucesso!',
    PASSWORD_RESET_SENT: 'Email de recuperação enviado com sucesso!',
    PASSWORD_CHANGED: 'Senha alterada com sucesso!',
    PROFILE_UPDATED: 'Perfil atualizado com sucesso!',
    EMAIL_VERIFIED: 'Email verificado com sucesso!',
  },

  // Configurações de cache
  CACHE_KEYS: {
    USER_PREFERENCES: 'user_preferences',
    LAST_LOGIN: 'last_login',
    REMEMBER_EMAIL: 'remember_email',
  },

  // Configurações de notificação
  NOTIFICATION_TYPES: {
    LOGIN_SUCCESS: 'login_success',
    LOGIN_FAILED: 'login_failed',
    PASSWORD_CHANGED: 'password_changed',
    PROFILE_UPDATED: 'profile_updated',
    ACCOUNT_LOCKED: 'account_locked',
  },
};

// Validadores de autenticação
export const AUTH_VALIDATORS = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPassword: (password: string): boolean => {
    const {PASSWORD_REQUIREMENTS} = AUTH_CONSTANTS;

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      return false;
    }

    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
      return false;
    }

    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
      return false;
    }

    if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
      return false;
    }

    if (
      PASSWORD_REQUIREMENTS.requireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      return false;
    }

    return true;
  },

  isValidUsername: (username: string): boolean => {
    const {USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_PATTERN} =
      AUTH_CONSTANTS;

    return (
      username.length >= USERNAME_MIN_LENGTH &&
      username.length <= USERNAME_MAX_LENGTH &&
      USERNAME_PATTERN.test(username)
    );
  },

  isValidDisplayName: (name: string): boolean => {
    const {DISPLAY_NAME_MIN_LENGTH, DISPLAY_NAME_MAX_LENGTH} = AUTH_CONSTANTS;

    return (
      name.trim().length >= DISPLAY_NAME_MIN_LENGTH &&
      name.trim().length <= DISPLAY_NAME_MAX_LENGTH
    );
  },

  isValidBio: (bio: string): boolean => {
    return bio.length <= AUTH_CONSTANTS.BIO_MAX_LENGTH;
  },
};

// Utilitários de autenticação
export const AUTH_UTILS = {
  // Calcular força da senha
  getPasswordStrength: (password: string): 'weak' | 'medium' | 'strong' => {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
  },

  // Gerar sugestão de username baseado no nome
  generateUsernameFromName: (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
  },

  // Verificar se o token está próximo do vencimento
  isTokenNearExpiry: (
    expiresAt: number,
    threshold: number = AUTH_CONSTANTS.TOKEN_REFRESH_THRESHOLD,
  ): boolean => {
    return Date.now() >= expiresAt - threshold;
  },

  // Calcular tempo restante até desbloqueio
  getTimeUntilUnblock: (lastAttempt: number): number => {
    const unblockTime = lastAttempt + AUTH_CONSTANTS.LOGIN_BLOCK_DURATION;
    return Math.max(0, unblockTime - Date.now());
  },

  // Formatar tempo de bloqueio
  formatBlockTime: (milliseconds: number): string => {
    const minutes = Math.ceil(milliseconds / (60 * 1000));
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  },
};
