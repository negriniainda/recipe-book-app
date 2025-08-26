// Basic test setup
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock react-native-paper
jest.mock('react-native-paper', () => ({
  Button: 'Button',
  Card: 'Card',
  Text: 'Text',
  TextInput: 'TextInput',
  FAB: 'FAB',
  Appbar: {
    Header: 'AppbarHeader',
    Content: 'AppbarContent',
    Action: 'AppbarAction',
    BackAction: 'AppbarBackAction',
  },
  Portal: ({ children }: { children: React.ReactNode }) => children,
  Modal: ({ children }: { children: React.ReactNode }) => children,
  Provider: ({ children }: { children: React.ReactNode }) => children,
  DefaultTheme: {},
}));

// Mock react-navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    isFocused: jest.fn(() => true),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
    name: 'TestScreen',
    key: 'test-key',
  }),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Flipper
jest.mock('react-native-flipper', () => ({
  logger: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Firebase
jest.mock('@react-native-firebase/app', () => ({
  utils: () => ({
    FilePath: {
      PICTURES_DIRECTORY: '/pictures',
      DOCUMENTS_DIRECTORY: '/documents',
    },
  }),
}));

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: () => ({
    hasPermission: jest.fn(() => Promise.resolve(true)),
    subscribeToTopic: jest.fn(),
    unsubscribeFromTopic: jest.fn(),
    requestPermission: jest.fn(() => Promise.resolve(true)),
    getToken: jest.fn(() => Promise.resolve('fcm-token')),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
    setBackgroundMessageHandler: jest.fn(),
  }),
}));

// Mock Image Picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
  MediaType: {
    photo: 'photo',
    video: 'video',
    mixed: 'mixed',
  },
}));

// Mock Permissions
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
    },
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    UNAVAILABLE: 'unavailable',
  },
  request: jest.fn(() => Promise.resolve('granted')),
  check: jest.fn(() => Promise.resolve('granted')),
}));

// Mock NetInfo
jest.mock('@react-native-netinfo/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock Stripe
jest.mock('@stripe/stripe-react-native', () => ({
  initStripe: jest.fn(() => Promise.resolve()),
  createPaymentMethod: jest.fn(() => Promise.resolve({ paymentMethod: { id: 'pm_test' } })),
  confirmPayment: jest.fn(() => Promise.resolve({ paymentIntent: { status: 'Succeeded' } })),
  isApplePaySupported: jest.fn(() => Promise.resolve(true)),
  presentApplePay: jest.fn(() => Promise.resolve()),
  confirmApplePayPayment: jest.fn(() => Promise.resolve({ paymentMethod: { id: 'pm_apple' } })),
}));

// Mock Detox (for E2E tests)
if (typeof global.device !== 'undefined') {
  jest.mock('detox', () => ({
    device: global.device,
    element: global.element,
    by: global.by,
    waitFor: global.waitFor,
    expect: global.expect,
  }));
}

// Global test utilities
global.mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

global.mockRoute = {
  params: {},
  name: 'TestScreen',
  key: 'test-key',
};

// Silence console warnings in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: componentWillReceiveProps has been renamed'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };

  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: componentWillReceiveProps has been renamed'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Custom matchers
expect.extend({
  toBeAccessible(received) {
    const pass = received.props.accessible !== false;
    if (pass) {
      return {
        message: () => `expected ${received} not to be accessible`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be accessible`,
        pass: false,
      };
    }
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(): R;
    }
  }
}