import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {AuthState} from '@/types/store';
import {User, LoginCredentials, RegisterData, SocialLoginData} from '@/types';
import {AuthResponse} from '@/types/api';

// Estado inicial
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
  },
  loginAttempts: 0,
  lastLoginAttempt: null,
};

// Async thunks para ações assíncronas
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, {rejectWithValue}) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error?.message || 'Login failed');
      }

      return data as AuthResponse;
    } catch (error) {
      return rejectWithValue('Network error');
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, {rejectWithValue}) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error?.message || 'Registration failed');
      }

      return data as AuthResponse;
    } catch (error) {
      return rejectWithValue('Network error');
    }
  },
);

export const socialLogin = createAsyncThunk(
  'auth/socialLogin',
  async (socialData: SocialLoginData, {rejectWithValue}) => {
    try {
      const response = await fetch('/api/auth/social', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(socialData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error?.message || 'Social login failed');
      }

      return data as AuthResponse;
    } catch (error) {
      return rejectWithValue('Network error');
    }
  },
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, {getState, rejectWithValue}) => {
    try {
      const state = getState() as {auth: AuthState};
      const {refreshToken: token} = state.auth.tokens;

      if (!token) {
        return rejectWithValue('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({refreshToken: token}),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error?.message || 'Token refresh failed');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error');
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, {getState}) => {
    try {
      const state = getState() as {auth: AuthState};
      const {accessToken} = state.auth.tokens;

      if (accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      // Ignorar erros de logout - sempre limpar estado local
      console.warn('Logout request failed:', error);
    }
  },
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }>,
    ) => {
      const {accessToken, refreshToken, expiresIn} = action.payload;
      state.tokens.accessToken = accessToken;
      state.tokens.refreshToken = refreshToken;
      state.tokens.expiresAt = Date.now() + expiresIn * 1000;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = {...state.user, ...action.payload};
      }
    },
    resetLoginAttempts: state => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
  },
  extraReducers: builder => {
    // Login
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tokens = {
          accessToken: action.payload.tokens.accessToken,
          refreshToken: action.payload.tokens.refreshToken,
          expiresAt: Date.now() + action.payload.tokens.expiresIn * 1000,
        };
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.loginAttempts += 1;
        state.lastLoginAttempt = Date.now();
      });

    // Register
    builder
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tokens = {
          accessToken: action.payload.tokens.accessToken,
          refreshToken: action.payload.tokens.refreshToken,
          expiresAt: Date.now() + action.payload.tokens.expiresIn * 1000,
        };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Social Login
    builder
      .addCase(socialLogin.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(socialLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tokens = {
          accessToken: action.payload.tokens.accessToken,
          refreshToken: action.payload.tokens.refreshToken,
          expiresAt: Date.now() + action.payload.tokens.expiresIn * 1000,
        };
      })
      .addCase(socialLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.tokens = {
          accessToken: action.payload.accessToken,
          refreshToken: state.tokens.refreshToken, // Manter o refresh token atual
          expiresAt: Date.now() + action.payload.expiresIn * 1000,
        };
      })
      .addCase(refreshToken.rejected, state => {
        // Token refresh falhou, fazer logout
        state.user = null;
        state.isAuthenticated = false;
        state.tokens = {
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
        };
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, state => {
      state.user = null;
      state.isAuthenticated = false;
      state.tokens = {
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      };
      state.error = null;
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    });
  },
});

export const {clearError, setTokens, updateUser, resetLoginAttempts} =
  authSlice.actions;
export default authSlice.reducer;
