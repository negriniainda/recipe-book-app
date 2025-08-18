import * as React from 'react';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, useAppSelector, useAppDispatch } from './store';
import { theme } from './utils/theme';
import { refreshToken } from './store/slices/authSlice';
import { LoadingScreen } from './components/auth/AuthGuard';
import { AppNavigator } from './navigation';
import { Toast } from './components/common';

const AppContent: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated, tokens, loading } = useAppSelector(
        state => state.auth,
    );

    // Verificar e renovar token na inicialização
    useEffect(() => {
        const checkAuthStatus = async () => {
            if (isAuthenticated && tokens.refreshToken) {
                const now = Date.now();
                const expiresAt = tokens.expiresAt;

                // Se o token expirou ou vai expirar em breve, tentar renovar
                if (
                    expiresAt &&
                    (now >= expiresAt || now >= expiresAt - 5 * 60 * 1000)
                ) {
                    try {
                        await dispatch(refreshToken()).unwrap();
                    } catch (error) {
                        console.warn('Failed to refresh token on app start:', error);
                    }
                }
            }
        };

        checkAuthStatus();
    }, [dispatch, isAuthenticated, tokens]);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={theme.colors.surface}
            />

            <AppNavigator />
            <Toast />
        </>
    );
};

const App: React.FC = () => {
    return (
        <ReduxProvider store={store}>
            <PersistGate loading={<LoadingScreen />} persistor={persistor}>
                <PaperProvider theme={theme}>
                    <AppContent />
                </PaperProvider>
            </PersistGate>
        </ReduxProvider>
    );
};

export default App;
