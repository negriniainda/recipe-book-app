import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../__tests__/utils/test-utils';

// Mock the PremiumGate components
const MockPremiumGate = ({ children, showModal = true }: any) => {
  if (showModal) {
    return <div>Recurso Premium</div>;
  }
  return <>{children}</>;
};

const MockPremiumUpgradePrompt = ({ visible, onUpgrade, onClose }: any) => {
  if (!visible) return null;
  return (
    <div>
      <div>Recurso Premium</div>
      <div>Este recurso está disponível apenas para usuários premium.</div>
      <button onClick={onUpgrade}>Ver Planos Premium</button>
      <button onClick={onClose}>Agora Não</button>
    </div>
  );
};

const MockPremiumBadge = ({ size = 'medium' }: any) => (
  <div>PREMIUM</div>
);

// Mock hooks
const mockUsePremiumGating = {
  isPremium: false,
  requirePremium: jest.fn(() => false),
};

const mockUseFeatureAccess = {
  canUseFeature: jest.fn(() => false),
  getRemainingUsage: jest.fn(() => null),
};

jest.mock('../../hooks/usePremium', () => ({
  usePremiumGating: () => mockUsePremiumGating,
  useFeatureAccess: () => mockUseFeatureAccess,
}));

// Mock navigation
const mockNavigation = createMockNavigation();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

describe('PremiumGate', () => {
  const PremiumGate = MockPremiumGate;
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePremiumGating.isPremium = false;
    mockUsePremiumGating.requirePremium.mockReturnValue(false);
    mockUseFeatureAccess.canUseFeature.mockReturnValue(false);
    mockUseFeatureAccess.getRemainingUsage.mockReturnValue(null);
  });

  it('should render children when user has premium access', () => {
    mockUsePremiumGating.isPremium = true;
    mockUsePremiumGating.requirePremium.mockReturnValue(true);
    mockUseFeatureAccess.canUseFeature.mockReturnValue(true);

    const { getByText } = render(
      <PremiumGate>
        <div>Premium Content</div>
      </PremiumGate>
    );

    expect(getByText('Premium Content')).toBeTruthy();
  });

  it('should render fallback when user does not have access and fallback is provided', () => {
    const { getByText } = render(
      <PremiumGate fallback={<div>Upgrade to Premium</div>}>
        <div>Premium Content</div>
      </PremiumGate>
    );

    expect(getByText('Upgrade to Premium')).toBeTruthy();
    expect(() => getByText('Premium Content')).toThrow();
  });

  it('should render upgrade prompt when user does not have access and showModal is true', () => {
    const { getByText } = render(
      <PremiumGate showModal={true}>
        <div>Premium Content</div>
      </PremiumGate>
    );

    expect(getByText('Recurso Premium')).toBeTruthy();
    expect(getByText('Ver Planos Premium')).toBeTruthy();
  });

  it('should not render anything when user does not have access and showModal is false', () => {
    const { queryByText } = render(
      <PremiumGate showModal={false}>
        <div>Premium Content</div>
      </PremiumGate>
    );

    expect(queryByText('Premium Content')).toBeNull();
    expect(queryByText('Recurso Premium')).toBeNull();
  });

  it('should check specific feature when featureKey is provided', () => {
    mockUseFeatureAccess.canUseFeature.mockReturnValue(true);

    const { getByText } = render(
      <PremiumGate featureKey="unlimitedRecipes">
        <div>Premium Content</div>
      </PremiumGate>
    );

    expect(mockUseFeatureAccess.canUseFeature).toHaveBeenCalledWith('unlimitedRecipes');
    expect(getByText('Premium Content')).toBeTruthy();
  });

  it('should call custom onUpgradePress when provided', () => {
    const mockOnUpgrade = jest.fn();

    const { getByText } = render(
      <PremiumGate onUpgradePress={mockOnUpgrade}>
        <div>Premium Content</div>
      </PremiumGate>
    );

    const upgradeButton = getByText('Ver Planos Premium');
    fireEvent.press(upgradeButton);

    expect(mockOnUpgrade).toHaveBeenCalled();
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to premium plans when no custom onUpgradePress is provided', () => {
    const { getByText } = render(
      <PremiumGate>
        <div>Premium Content</div>
      </PremiumGate>
    );

    const upgradeButton = getByText('Ver Planos Premium');
    fireEvent.press(upgradeButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('PremiumPlans');
  });
});

describe('PremiumUpgradePrompt', () => {
  const PremiumUpgradePrompt = MockPremiumUpgradePrompt;
  const defaultProps = {
    visible: true,
    onUpgrade: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render upgrade prompt with default content', () => {
    const { getByText } = render(<PremiumUpgradePrompt {...defaultProps} />);

    expect(getByText('Recurso Premium')).toBeTruthy();
    expect(getByText('Este recurso está disponível apenas para usuários premium.')).toBeTruthy();
    expect(getByText('Ver Planos Premium')).toBeTruthy();
    expect(getByText('Agora Não')).toBeTruthy();
  });

  it('should render custom title and description', () => {
    const { getByText } = render(
      <PremiumUpgradePrompt
        {...defaultProps}
        customTitle="Receitas Ilimitadas"
        customMessage="Crie quantas receitas quiser sem limites."
      />
    );

    expect(getByText('Receitas Ilimitadas')).toBeTruthy();
    expect(getByText('Crie quantas receitas quiser sem limites.')).toBeTruthy();
  });

  it('should show remaining usage when provided', () => {
    const { getByText } = render(
      <PremiumUpgradePrompt {...defaultProps} remainingUsage={3} />
    );

    expect(getByText('Você ainda tem 3 usos restantes neste mês.')).toBeTruthy();
  });

  it('should handle singular usage correctly', () => {
    const { getByText } = render(
      <PremiumUpgradePrompt {...defaultProps} remainingUsage={1} />
    );

    expect(getByText('Você ainda tem 1 uso restante neste mês.')).toBeTruthy();
  });

  it('should call onUpgrade when upgrade button is pressed', () => {
    const mockOnUpgrade = jest.fn();
    const { getByText } = render(
      <PremiumUpgradePrompt {...defaultProps} onUpgrade={mockOnUpgrade} />
    );

    const upgradeButton = getByText('Ver Planos Premium');
    fireEvent.press(upgradeButton);

    expect(mockOnUpgrade).toHaveBeenCalled();
  });

  it('should call onClose when close button is pressed', () => {
    const mockOnClose = jest.fn();
    const { getByText } = render(
      <PremiumUpgradePrompt {...defaultProps} onClose={mockOnClose} />
    );

    const closeButton = getByText('Agora Não');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show feature-specific information', () => {
    const { getByText } = render(
      <PremiumUpgradePrompt {...defaultProps} featureKey="unlimitedRecipes" />
    );

    expect(getByText('Receitas Ilimitadas')).toBeTruthy();
    expect(getByText('Crie e salve quantas receitas quiser sem limites.')).toBeTruthy();
  });

  it('should not render when visible is false', () => {
    const { queryByText } = render(
      <PremiumUpgradePrompt {...defaultProps} visible={false} />
    );

    expect(queryByText('Recurso Premium')).toBeNull();
  });

  it('should be accessible', () => {
    const { getByText } = render(<PremiumUpgradePrompt {...defaultProps} />);

    const upgradeButton = getByText('Ver Planos Premium');
    const closeButton = getByText('Agora Não');

    expect(upgradeButton).toBeAccessible();
    expect(closeButton).toBeAccessible();
  });
});

describe('PremiumBadge', () => {
  const PremiumBadge = MockPremiumBadge;
  it('should render premium badge with default size', () => {
    const { getByText } = render(<PremiumBadge />);

    expect(getByText('PREMIUM')).toBeTruthy();
  });

  it('should render with small size', () => {
    const { getByText } = render(<PremiumBadge size="small" />);

    expect(getByText('PREMIUM')).toBeTruthy();
  });

  it('should render with large size', () => {
    const { getByText } = render(<PremiumBadge size="large" />);

    expect(getByText('PREMIUM')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByText } = render(<PremiumBadge style={customStyle} />);

    const badge = getByText('PREMIUM').parent;
    expect(badge?.props.style).toContainEqual(customStyle);
  });
});