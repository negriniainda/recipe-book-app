const { DetoxCircusEnvironment, SpecReporter, WorkerAssignReporter } = require('detox/runners/jest');

const config = require('../package.json').detox;

const specReporter = new SpecReporter({ detoxConfig: config });
const workerAssignReporter = new WorkerAssignReporter();

class CustomDetoxEnvironment extends DetoxCircusEnvironment {
  constructor(config, context) {
    super(config, context);

    // Can be safely removed, if you are content with the default value (=300000ms)
    this.initTimeout = 300000;

    // This takes care of generating status logs on a per-spec basis. By default, Jest only reports at file-level.
    // This is strictly optional.
    this.registerListeners({
      specReporter,
      workerAssignReporter,
    });
  }

  async handleTestEvent(event, state) {
    await super.handleTestEvent(event, state);
  }
}

module.exports = CustomDetoxEnvironment;

// Global test helpers
global.waitForElement = async (element, timeout = 5000) => {
  await waitFor(element).toBeVisible().withTimeout(timeout);
};

global.tapAndWait = async (element, waitElement, timeout = 3000) => {
  await element.tap();
  await waitFor(waitElement).toBeVisible().withTimeout(timeout);
};

global.typeTextAndConfirm = async (element, text) => {
  await element.tap();
  await element.typeText(text);
  if (device.getPlatform() === 'ios') {
    await element.tapReturnKey();
  }
};

global.scrollToElement = async (scrollView, element, direction = 'down', speed = 'fast') => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    try {
      await expect(element).toBeVisible();
      break;
    } catch (error) {
      await scrollView.scroll(200, direction, NaN, speed);
      attempts++;
    }
  }
  
  if (attempts === maxAttempts) {
    throw new Error('Element not found after scrolling');
  }
};

global.takeScreenshot = async (name) => {
  await device.takeScreenshot(name);
};

global.relaunchApp = async (params = {}) => {
  await device.terminateApp();
  await device.launchApp(params);
};

// Test data helpers
global.generateTestRecipe = (index = 1) => ({
  title: `Test Recipe ${index}`,
  description: `Description for test recipe ${index}`,
  ingredients: [
    { name: `Ingredient ${index}A`, amount: '1 cup' },
    { name: `Ingredient ${index}B`, amount: '2 tbsp' },
  ],
  instructions: [
    `Step 1 for recipe ${index}`,
    `Step 2 for recipe ${index}`,
  ],
  prepTime: 10 + index,
  cookTime: 20 + index,
  servings: 2 + index,
  difficulty: ['easy', 'medium', 'hard'][index % 3],
  category: ['appetizer', 'main-course', 'dessert'][index % 3],
});

global.createTestUser = (index = 1) => ({
  email: `testuser${index}@example.com`,
  password: 'testpassword123',
  displayName: `Test User ${index}`,
});

// Platform-specific helpers
global.isIOS = () => device.getPlatform() === 'ios';
global.isAndroid = () => device.getPlatform() === 'android';

global.platformSelect = (ios, android) => {
  return isIOS() ? ios : android;
};

// Network helpers
global.goOffline = async () => {
  await device.setURLBlacklist(['.*']);
};

global.goOnline = async () => {
  await device.setURLBlacklist([]);
};

// Accessibility helpers
global.enableAccessibility = async () => {
  if (isIOS()) {
    await device.setAccessibilityEnabled(true);
  }
};

global.disableAccessibility = async () => {
  if (isIOS()) {
    await device.setAccessibilityEnabled(false);
  }
};

// Performance helpers
global.measurePerformance = async (testName, testFunction) => {
  const startTime = Date.now();
  await testFunction();
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`Performance: ${testName} took ${duration}ms`);
  
  return duration;
};

// Error handling
global.retryTest = async (testFunction, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await testFunction();
      return;
    } catch (error) {
      lastError = error;
      console.log(`Test attempt ${i + 1} failed:`, error.message);
      
      if (i < maxRetries - 1) {
        await device.reloadReactNative();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  throw lastError;
};

// Cleanup helpers
global.cleanupTestData = async () => {
  // Clean up any test data created during tests
  // This would typically involve API calls to clean up test users, recipes, etc.
  console.log('Cleaning up test data...');
};

// Setup and teardown
beforeAll(async () => {
  console.log('Starting E2E test suite...');
  await device.launchApp();
});

afterAll(async () => {
  console.log('E2E test suite completed.');
  await cleanupTestData();
});

beforeEach(async () => {
  // Reset app state before each test
  await device.reloadReactNative();
});

afterEach(async () => {
  // Take screenshot on test failure
  if (jasmine.currentTest && jasmine.currentTest.failedExpectations.length > 0) {
    const testName = jasmine.currentTest.fullName.replace(/\s+/g, '_');
    await takeScreenshot(`failed_${testName}`);
  }
});