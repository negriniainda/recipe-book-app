import { NativeModules } from 'react-native';

// Mock NativeModules
NativeModules.RNCNetInfo = {
  getCurrentState: jest.fn(() => Promise.resolve({ isConnected: true })),
  addListener: jest.fn(),
  removeListeners: jest.fn(),
};

NativeModules.RNImagePicker = {
  showImagePicker: jest.fn(),
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
};

NativeModules.RNPermissions = {
  openSettings: jest.fn(() => Promise.resolve()),
  check: jest.fn(() => Promise.resolve('granted')),
  request: jest.fn(() => Promise.resolve('granted')),
  checkMultiple: jest.fn(() => Promise.resolve({})),
  requestMultiple: jest.fn(() => Promise.resolve({})),
};

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios || obj.default),
}));

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({
    width: 375,
    height: 812,
    scale: 2,
    fontScale: 1,
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
  prompt: jest.fn(),
}));

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock Keyboard
jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => ({
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  dismiss: jest.fn(),
}));

// Mock StatusBar
jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => ({
  setBarStyle: jest.fn(),
  setBackgroundColor: jest.fn(),
  setTranslucent: jest.fn(),
  setHidden: jest.fn(),
}));

// Mock BackHandler
jest.mock('react-native/Libraries/Utilities/BackHandler', () => ({
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
  exitApp: jest.fn(),
}));

// Mock AppState
jest.mock('react-native/Libraries/AppState/AppState', () => ({
  currentState: 'active',
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
}));

// Mock PanResponder
jest.mock('react-native/Libraries/Interaction/PanResponder', () => ({
  create: jest.fn(() => ({
    panHandlers: {},
  })),
}));

// Mock Animated
const mockAnimatedValue = {
  setValue: jest.fn(),
  setOffset: jest.fn(),
  flattenOffset: jest.fn(),
  extractOffset: jest.fn(),
  addListener: jest.fn(() => 'listener-id'),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  stopAnimation: jest.fn(),
  resetAnimation: jest.fn(),
  interpolate: jest.fn(() => mockAnimatedValue),
};

const mockAnimatedTiming = jest.fn(() => ({
  start: jest.fn((callback) => callback && callback({ finished: true })),
  stop: jest.fn(),
  reset: jest.fn(),
}));

jest.mock('react-native/Libraries/Animated/Animated', () => ({
  Value: jest.fn(() => mockAnimatedValue),
  ValueXY: jest.fn(() => ({
    x: mockAnimatedValue,
    y: mockAnimatedValue,
    setValue: jest.fn(),
    setOffset: jest.fn(),
    flattenOffset: jest.fn(),
    extractOffset: jest.fn(),
    addListener: jest.fn(() => 'listener-id'),
    removeListener: jest.fn(),
    stopAnimation: jest.fn(),
    resetAnimation: jest.fn(),
    getLayout: jest.fn(() => ({ left: mockAnimatedValue, top: mockAnimatedValue })),
    getTranslateTransform: jest.fn(() => [
      { translateX: mockAnimatedValue },
      { translateY: mockAnimatedValue },
    ]),
  })),
  timing: mockAnimatedTiming,
  spring: mockAnimatedTiming,
  decay: mockAnimatedTiming,
  sequence: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
  parallel: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
  stagger: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
  delay: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
  loop: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
  event: jest.fn(() => jest.fn()),
  createAnimatedComponent: jest.fn((component) => component),
  View: 'Animated.View',
  Text: 'Animated.Text',
  ScrollView: 'Animated.ScrollView',
  Image: 'Animated.Image',
  FlatList: 'Animated.FlatList',
}));

// Mock LayoutAnimation
jest.mock('react-native/Libraries/LayoutAnimation/LayoutAnimation', () => ({
  configureNext: jest.fn(),
  create: jest.fn(),
  Types: {
    spring: 'spring',
    linear: 'linear',
    easeInEaseOut: 'easeInEaseOut',
    easeIn: 'easeIn',
    easeOut: 'easeOut',
    keyboard: 'keyboard',
  },
  Properties: {
    opacity: 'opacity',
    scaleX: 'scaleX',
    scaleY: 'scaleY',
    scaleXY: 'scaleXY',
  },
  Presets: {
    easeInEaseOut: 'easeInEaseOut',
    linear: 'linear',
    spring: 'spring',
  },
}));

// Mock Share
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
}));

// Mock Vibration
jest.mock('react-native/Libraries/Vibration/Vibration', () => ({
  vibrate: jest.fn(),
  cancel: jest.fn(),
}));

// Mock PermissionsAndroid
jest.mock('react-native/Libraries/PermissionsAndroid/PermissionsAndroid', () => ({
  request: jest.fn(() => Promise.resolve('granted')),
  check: jest.fn(() => Promise.resolve(true)),
  requestMultiple: jest.fn(() => Promise.resolve({})),
  PERMISSIONS: {
    CAMERA: 'android.permission.CAMERA',
    READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
    WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    NEVER_ASK_AGAIN: 'never_ask_again',
  },
}));