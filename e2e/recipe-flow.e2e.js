describe('Recipe Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Recipe List Screen', () => {
    it('should show recipe list on launch', async () => {
      await expect(element(by.id('recipes-screen'))).toBeVisible();
      await expect(element(by.text('Receitas'))).toBeVisible();
    });

    it('should display recipes when loaded', async () => {
      await waitFor(element(by.id('recipe-card-1')))
        .toBeVisible()
        .withTimeout(5000);
      
      await expect(element(by.id('recipe-card-1'))).toBeVisible();
    });

    it('should navigate to recipe details when recipe is tapped', async () => {
      await waitFor(element(by.id('recipe-card-1')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('recipe-card-1')).tap();
      
      await expect(element(by.id('recipe-details-screen'))).toBeVisible();
      await expect(element(by.text('Detalhes da Receita'))).toBeVisible();
    });

    it('should open add recipe screen when FAB is tapped', async () => {
      await element(by.id('add-recipe-fab')).tap();
      
      await expect(element(by.id('add-recipe-screen'))).toBeVisible();
      await expect(element(by.text('Nova Receita'))).toBeVisible();
    });
  });

  describe('Recipe Search', () => {
    it('should search recipes by title', async () => {
      await element(by.id('search-input')).tap();
      await element(by.id('search-input')).typeText('pasta');
      
      await waitFor(element(by.text('Pasta Carbonara')))
        .toBeVisible()
        .withTimeout(3000);
      
      await expect(element(by.text('Pasta Carbonara'))).toBeVisible();
      
      // Should not show non-pasta recipes
      await expect(element(by.text('Chicken Curry'))).not.toBeVisible();
    });

    it('should clear search results', async () => {
      await element(by.id('search-input')).tap();
      await element(by.id('search-input')).typeText('pasta');
      
      await waitFor(element(by.text('Pasta Carbonara')))
        .toBeVisible()
        .withTimeout(3000);
      
      await element(by.id('clear-search-button')).tap();
      
      // Should show all recipes again
      await expect(element(by.text('Chicken Curry'))).toBeVisible();
    });

    it('should show no results message for invalid search', async () => {
      await element(by.id('search-input')).tap();
      await element(by.id('search-input')).typeText('nonexistentrecipe');
      
      await waitFor(element(by.text('Nenhuma receita encontrada')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Recipe Filters', () => {
    it('should filter recipes by category', async () => {
      await element(by.id('filter-button')).tap();
      
      await expect(element(by.id('filter-modal'))).toBeVisible();
      
      await element(by.text('Sobremesas')).tap();
      await element(by.text('Aplicar Filtros')).tap();
      
      await waitFor(element(by.text('Chocolate Cake')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Should not show main course recipes
      await expect(element(by.text('Pasta Carbonara'))).not.toBeVisible();
    });

    it('should filter recipes by difficulty', async () => {
      await element(by.id('filter-button')).tap();
      
      await element(by.text('Fácil')).tap();
      await element(by.text('Aplicar Filtros')).tap();
      
      await waitFor(element(by.text('Simple Salad')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Should not show hard recipes
      await expect(element(by.text('Complex Dish'))).not.toBeVisible();
    });

    it('should clear all filters', async () => {
      await element(by.id('filter-button')).tap();
      await element(by.text('Sobremesas')).tap();
      await element(by.text('Aplicar Filtros')).tap();
      
      // Apply filter first
      await waitFor(element(by.text('Chocolate Cake')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Clear filters
      await element(by.id('filter-button')).tap();
      await element(by.text('Limpar Filtros')).tap();
      
      // Should show all recipes again
      await expect(element(by.text('Pasta Carbonara'))).toBeVisible();
    });
  });

  describe('Recipe Details Screen', () => {
    beforeEach(async () => {
      await waitFor(element(by.id('recipe-card-1')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('recipe-card-1')).tap();
    });

    it('should display recipe information', async () => {
      await expect(element(by.id('recipe-title'))).toBeVisible();
      await expect(element(by.id('recipe-description'))).toBeVisible();
      await expect(element(by.id('recipe-ingredients'))).toBeVisible();
      await expect(element(by.id('recipe-instructions'))).toBeVisible();
    });

    it('should start cooking mode', async () => {
      await element(by.id('start-cooking-button')).tap();
      
      await expect(element(by.id('cooking-mode-screen'))).toBeVisible();
      await expect(element(by.text('Modo Cozinha'))).toBeVisible();
    });

    it('should add recipe to favorites', async () => {
      await element(by.id('favorite-button')).tap();
      
      await expect(element(by.text('Receita adicionada aos favoritos'))).toBeVisible();
    });

    it('should share recipe', async () => {
      await element(by.id('share-button')).tap();
      
      // Share modal should appear (implementation depends on platform)
      await waitFor(element(by.text('Compartilhar')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Add Recipe Flow', () => {
    beforeEach(async () => {
      await element(by.id('add-recipe-fab')).tap();
    });

    it('should create a new recipe', async () => {
      await element(by.id('recipe-title-input')).typeText('Test Recipe E2E');
      await element(by.id('recipe-description-input')).typeText('A test recipe created via E2E');
      
      // Add ingredient
      await element(by.id('add-ingredient-button')).tap();
      await element(by.id('ingredient-name-input')).typeText('Test Ingredient');
      await element(by.id('ingredient-amount-input')).typeText('1 cup');
      await element(by.id('save-ingredient-button')).tap();
      
      // Add instruction
      await element(by.id('add-instruction-button')).tap();
      await element(by.id('instruction-input')).typeText('Mix all ingredients');
      await element(by.id('save-instruction-button')).tap();
      
      // Set cooking times
      await element(by.id('prep-time-input')).typeText('10');
      await element(by.id('cook-time-input')).typeText('20');
      await element(by.id('servings-input')).typeText('4');
      
      // Save recipe
      await element(by.id('save-recipe-button')).tap();
      
      await expect(element(by.text('Receita criada com sucesso'))).toBeVisible();
      
      // Should navigate back to recipe list
      await expect(element(by.id('recipes-screen'))).toBeVisible();
      
      // New recipe should be visible
      await expect(element(by.text('Test Recipe E2E'))).toBeVisible();
    });

    it('should validate required fields', async () => {
      await element(by.id('save-recipe-button')).tap();
      
      await expect(element(by.text('Título é obrigatório'))).toBeVisible();
    });

    it('should cancel recipe creation', async () => {
      await element(by.id('recipe-title-input')).typeText('Test Recipe');
      
      await element(by.id('cancel-button')).tap();
      
      // Should show confirmation dialog
      await expect(element(by.text('Descartar alterações?'))).toBeVisible();
      
      await element(by.text('Sim')).tap();
      
      // Should navigate back to recipe list
      await expect(element(by.id('recipes-screen'))).toBeVisible();
    });
  });

  describe('Cooking Mode Flow', () => {
    beforeEach(async () => {
      await waitFor(element(by.id('recipe-card-1')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('recipe-card-1')).tap();
      await element(by.id('start-cooking-button')).tap();
    });

    it('should navigate through cooking steps', async () => {
      await expect(element(by.id('cooking-step-1'))).toBeVisible();
      
      await element(by.id('next-step-button')).tap();
      
      await expect(element(by.id('cooking-step-2'))).toBeVisible();
      
      await element(by.id('previous-step-button')).tap();
      
      await expect(element(by.id('cooking-step-1'))).toBeVisible();
    });

    it('should start and stop timers', async () => {
      await element(by.id('timer-button')).tap();
      
      await expect(element(by.text('Timer iniciado'))).toBeVisible();
      
      await element(by.id('stop-timer-button')).tap();
      
      await expect(element(by.text('Timer parado'))).toBeVisible();
    });

    it('should exit cooking mode', async () => {
      await element(by.id('exit-cooking-button')).tap();
      
      await expect(element(by.text('Sair do modo cozinha?'))).toBeVisible();
      
      await element(by.text('Sim')).tap();
      
      await expect(element(by.id('recipe-details-screen'))).toBeVisible();
    });
  });

  describe('Premium Features', () => {
    it('should show premium gate for unlimited recipes', async () => {
      // Assuming user is not premium
      await element(by.id('add-recipe-fab')).tap();
      
      // Try to create more than the free limit
      for (let i = 0; i < 6; i++) {
        await element(by.id('recipe-title-input')).clearText();
        await element(by.id('recipe-title-input')).typeText(`Recipe ${i + 1}`);
        await element(by.id('save-recipe-button')).tap();
        
        if (i < 5) {
          await expect(element(by.text('Receita criada com sucesso'))).toBeVisible();
          await element(by.id('add-recipe-fab')).tap();
        }
      }
      
      // Should show premium gate
      await expect(element(by.text('Recurso Premium'))).toBeVisible();
      await expect(element(by.text('Ver Planos Premium'))).toBeVisible();
    });

    it('should navigate to premium plans', async () => {
      // Trigger premium gate first
      await element(by.id('premium-feature-button')).tap();
      
      await expect(element(by.text('Ver Planos Premium'))).toBeVisible();
      
      await element(by.text('Ver Planos Premium')).tap();
      
      await expect(element(by.id('premium-plans-screen'))).toBeVisible();
      await expect(element(by.text('Planos Premium'))).toBeVisible();
    });
  });

  describe('Offline Mode', () => {
    it('should work offline with cached recipes', async () => {
      // First load recipes online
      await waitFor(element(by.id('recipe-card-1')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Simulate offline mode
      await device.setURLBlacklist(['.*']);
      
      // Should still show cached recipes
      await expect(element(by.id('recipe-card-1'))).toBeVisible();
      
      // Should show offline indicator
      await expect(element(by.text('Modo Offline'))).toBeVisible();
      
      // Re-enable network
      await device.setURLBlacklist([]);
    });

    it('should sync changes when back online', async () => {
      // Create recipe offline
      await device.setURLBlacklist(['.*']);
      
      await element(by.id('add-recipe-fab')).tap();
      await element(by.id('recipe-title-input')).typeText('Offline Recipe');
      await element(by.id('save-recipe-button')).tap();
      
      await expect(element(by.text('Receita salva localmente'))).toBeVisible();
      
      // Go back online
      await device.setURLBlacklist([]);
      
      // Should sync automatically
      await waitFor(element(by.text('Sincronização concluída')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Accessibility', () => {
    it('should be navigable with screen reader', async () => {
      // Enable accessibility
      await device.enableSynchronization();
      
      // Test main navigation
      await expect(element(by.id('recipes-screen'))).toBeVisible();
      
      // Test recipe card accessibility
      await expect(element(by.id('recipe-card-1'))).toHaveAccessibilityLabel();
      
      // Test button accessibility
      await expect(element(by.id('add-recipe-fab'))).toHaveAccessibilityLabel();
    });

    it('should support voice control', async () => {
      // Navigate to cooking mode
      await waitFor(element(by.id('recipe-card-1')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('recipe-card-1')).tap();
      await element(by.id('start-cooking-button')).tap();
      
      // Test voice commands (if implemented)
      await expect(element(by.id('voice-control-indicator'))).toBeVisible();
    });
  });

  describe('Performance', () => {
    it('should load recipes quickly', async () => {
      const startTime = Date.now();
      
      await waitFor(element(by.id('recipe-card-1')))
        .toBeVisible()
        .withTimeout(5000);
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    it('should handle large recipe lists smoothly', async () => {
      // Scroll through large list
      await element(by.id('recipes-list')).scroll(2000, 'down');
      await element(by.id('recipes-list')).scroll(2000, 'down');
      await element(by.id('recipes-list')).scroll(2000, 'down');
      
      // Should still be responsive
      await expect(element(by.id('recipes-screen'))).toBeVisible();
    });
  });
});