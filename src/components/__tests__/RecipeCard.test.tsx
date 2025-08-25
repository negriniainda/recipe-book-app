import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { RecipeCard } from '../recipe/RecipeCard';
import { render, createMockRecipe, createMockNavigation } from '../../__tests__/utils/test-utils';

// Mock navigation
const mockNavigation = createMockNavigation();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

describe('RecipeCard', () => {
  const mockRecipe = createMockRecipe({
    id: '1',
    title: 'Test Recipe',
    description: 'A delicious test recipe',
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: 'medium',
    rating: 4.5,
    reviewCount: 10,
    images: ['https://example.com/image.jpg'],
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render recipe information correctly', () => {
    const { getByText, getByLabelText } = render(
      <RecipeCard recipe={mockRecipe} />
    );

    expect(getByText('Test Recipe')).toBeTruthy();
    expect(getByText('A delicious test recipe')).toBeTruthy();
    expect(getByText('15 min')).toBeTruthy();
    expect(getByText('30 min')).toBeTruthy();
    expect(getByText('4 porções')).toBeTruthy();
    expect(getByText('Médio')).toBeTruthy();
    expect(getByLabelText('Receita Test Recipe')).toBeTruthy();
  });

  it('should display rating and review count', () => {
    const { getByText } = render(<RecipeCard recipe={mockRecipe} />);

    expect(getByText('4.5')).toBeTruthy();
    expect(getByText('(10)')).toBeTruthy();
  });

  it('should navigate to recipe details when pressed', () => {
    const { getByLabelText } = render(<RecipeCard recipe={mockRecipe} />);

    const recipeCard = getByLabelText('Receita Test Recipe');
    fireEvent.press(recipeCard);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('RecipeDetails', {
      recipeId: '1',
    });
  });

  it('should handle missing image gracefully', () => {
    const recipeWithoutImage = createMockRecipe({
      ...mockRecipe,
      images: [],
    });

    const { getByLabelText } = render(<RecipeCard recipe={recipeWithoutImage} />);

    // Should still render the card
    expect(getByLabelText('Receita Test Recipe')).toBeTruthy();
  });

  it('should display difficulty levels correctly', () => {
    const easyRecipe = createMockRecipe({ ...mockRecipe, difficulty: 'easy' });
    const hardRecipe = createMockRecipe({ ...mockRecipe, difficulty: 'hard' });

    const { rerender, getByText } = render(<RecipeCard recipe={easyRecipe} />);
    expect(getByText('Fácil')).toBeTruthy();

    rerender(<RecipeCard recipe={hardRecipe} />);
    expect(getByText('Difícil')).toBeTruthy();
  });

  it('should handle zero ratings', () => {
    const unratedRecipe = createMockRecipe({
      ...mockRecipe,
      rating: 0,
      reviewCount: 0,
    });

    const { getByText } = render(<RecipeCard recipe={unratedRecipe} />);

    expect(getByText('0.0')).toBeTruthy();
    expect(getByText('(0)')).toBeTruthy();
  });

  it('should be accessible', () => {
    const { getByLabelText } = render(<RecipeCard recipe={mockRecipe} />);

    const recipeCard = getByLabelText('Receita Test Recipe');
    expect(recipeCard).toBeAccessible();
  });

  it('should handle long titles gracefully', () => {
    const longTitleRecipe = createMockRecipe({
      ...mockRecipe,
      title: 'This is a very long recipe title that should be handled gracefully by the component',
    });

    const { getByText } = render(<RecipeCard recipe={longTitleRecipe} />);

    expect(getByText('This is a very long recipe title that should be handled gracefully by the component')).toBeTruthy();
  });

  it('should display correct time format', () => {
    const longTimeRecipe = createMockRecipe({
      ...mockRecipe,
      prepTime: 90, // 1.5 hours
      cookTime: 120, // 2 hours
    });

    const { getByText } = render(<RecipeCard recipe={longTimeRecipe} />);

    expect(getByText('90 min')).toBeTruthy();
    expect(getByText('120 min')).toBeTruthy();
  });

  it('should handle single serving correctly', () => {
    const singleServingRecipe = createMockRecipe({
      ...mockRecipe,
      servings: 1,
    });

    const { getByText } = render(<RecipeCard recipe={singleServingRecipe} />);

    expect(getByText('1 porção')).toBeTruthy();
  });

  it('should show favorite button when onFavorite is provided', () => {
    const mockOnFavorite = jest.fn();
    const { getByLabelText } = render(
      <RecipeCard recipe={mockRecipe} onFavorite={mockOnFavorite} />
    );

    const favoriteButton = getByLabelText('Adicionar aos favoritos');
    expect(favoriteButton).toBeTruthy();

    fireEvent.press(favoriteButton);
    expect(mockOnFavorite).toHaveBeenCalledWith(mockRecipe);
  });

  it('should show share button when onShare is provided', () => {
    const mockOnShare = jest.fn();
    const { getByLabelText } = render(
      <RecipeCard recipe={mockRecipe} onShare={mockOnShare} />
    );

    const shareButton = getByLabelText('Compartilhar receita');
    expect(shareButton).toBeTruthy();

    fireEvent.press(shareButton);
    expect(mockOnShare).toHaveBeenCalledWith(mockRecipe);
  });

  it('should apply custom style when provided', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByLabelText } = render(
      <RecipeCard recipe={mockRecipe} style={customStyle} />
    );

    const recipeCard = getByLabelText('Receita Test Recipe');
    expect(recipeCard.props.style).toContainEqual(customStyle);
  });

  it('should handle compact mode', () => {
    const { getByText, queryByText } = render(
      <RecipeCard recipe={mockRecipe} compact />
    );

    // In compact mode, description might be hidden
    expect(getByText('Test Recipe')).toBeTruthy();
    // Description might not be visible in compact mode
    // This depends on the actual implementation
  });
});