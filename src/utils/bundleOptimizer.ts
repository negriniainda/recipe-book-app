// Bundle optimization utilities
export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  dependencies: DependencyInfo[];
  duplicates: DuplicateInfo[];
  unusedExports: UnusedExportInfo[];
}

export interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize: number;
  modules: ModuleInfo[];
  isAsync: boolean;
  parents: string[];
  children: string[];
}

export interface ModuleInfo {
  name: string;
  size: number;
  reasons: string[];
  isEntry: boolean;
  isExternal: boolean;
}

export interface DependencyInfo {
  name: string;
  version: string;
  size: number;
  isDevDependency: boolean;
  isUnused: boolean;
  alternatives?: string[];
}

export interface DuplicateInfo {
  name: string;
  versions: string[];
  totalSize: number;
  locations: string[];
}

export interface UnusedExportInfo {
  module: string;
  exports: string[];
  potentialSavings: number;
}

// Bundle optimization service
class BundleOptimizerService {
  private static instance: BundleOptimizerService;
  
  static getInstance(): BundleOptimizerService {
    if (!BundleOptimizerService.instance) {
      BundleOptimizerService.instance = new BundleOptimizerService();
    }
    return BundleOptimizerService.instance;
  }

  // Analyze current bundle
  async analyzeBundleSize(): Promise<BundleAnalysis> {
    // In a real implementation, this would integrate with webpack-bundle-analyzer
    // or similar tools to get actual bundle information
    
    const mockAnalysis: BundleAnalysis = {
      totalSize: 2048000, // 2MB
      gzippedSize: 512000, // 512KB
      chunks: [
        {
          name: 'main',
          size: 1024000,
          gzippedSize: 256000,
          modules: [
            {
              name: './src/App.tsx',
              size: 50000,
              reasons: ['entry'],
              isEntry: true,
              isExternal: false,
            },
            {
              name: './src/screens/recipe/RecipesScreen.tsx',
              size: 75000,
              reasons: ['./src/App.tsx'],
              isEntry: false,
              isExternal: false,
            },
          ],
          isAsync: false,
          parents: [],
          children: ['vendor', 'async-components'],
        },
        {
          name: 'vendor',
          size: 512000,
          gzippedSize: 128000,
          modules: [
            {
              name: 'react-native',
              size: 200000,
              reasons: ['./src/App.tsx'],
              isEntry: false,
              isExternal: true,
            },
            {
              name: '@reduxjs/toolkit',
              size: 150000,
              reasons: ['./src/store/index.ts'],
              isEntry: false,
              isExternal: true,
            },
          ],
          isAsync: false,
          parents: ['main'],
          children: [],
        },
        {
          name: 'async-components',
          size: 256000,
          gzippedSize: 64000,
          modules: [],
          isAsync: true,
          parents: ['main'],
          children: [],
        },
      ],
      dependencies: [
        {
          name: 'react-native',
          version: '0.72.0',
          size: 200000,
          isDevDependency: false,
          isUnused: false,
        },
        {
          name: 'lodash',
          version: '4.17.21',
          size: 70000,
          isDevDependency: false,
          isUnused: false,
          alternatives: ['lodash-es', 'ramda'],
        },
      ],
      duplicates: [
        {
          name: 'moment',
          versions: ['2.29.1', '2.29.4'],
          totalSize: 120000,
          locations: ['node_modules/moment', 'node_modules/react-native-calendars/node_modules/moment'],
        },
      ],
      unusedExports: [
        {
          module: './src/utils/helpers.ts',
          exports: ['unusedFunction1', 'unusedFunction2'],
          potentialSavings: 5000,
        },
      ],
    };

    return mockAnalysis;
  }

  // Get optimization recommendations
  getOptimizationRecommendations(analysis: BundleAnalysis): string[] {
    const recommendations: string[] = [];

    // Check for large chunks
    const largeChunks = analysis.chunks.filter(chunk => chunk.size > 500000);
    if (largeChunks.length > 0) {
      recommendations.push(
        `Consider splitting large chunks: ${largeChunks.map(c => c.name).join(', ')}`
      );
    }

    // Check for duplicates
    if (analysis.duplicates.length > 0) {
      recommendations.push(
        `Remove duplicate dependencies: ${analysis.duplicates.map(d => d.name).join(', ')}`
      );
    }

    // Check for unused exports
    if (analysis.unusedExports.length > 0) {
      const totalSavings = analysis.unusedExports.reduce((sum, exp) => sum + exp.potentialSavings, 0);
      recommendations.push(
        `Remove unused exports to save ~${(totalSavings / 1000).toFixed(1)}KB`
      );
    }

    // Check for heavy dependencies
    const heavyDeps = analysis.dependencies.filter(dep => dep.size > 100000);
    if (heavyDeps.length > 0) {
      recommendations.push(
        `Consider lighter alternatives for: ${heavyDeps.map(d => d.name).join(', ')}`
      );
    }

    // Check compression ratio
    const compressionRatio = analysis.gzippedSize / analysis.totalSize;
    if (compressionRatio > 0.3) {
      recommendations.push(
        'Bundle compression ratio is low. Consider enabling better compression or tree shaking.'
      );
    }

    return recommendations;
  }

  // Generate bundle report
  generateBundleReport(analysis: BundleAnalysis): string {
    const recommendations = this.getOptimizationRecommendations(analysis);
    
    return `
# Bundle Analysis Report

## Summary
- **Total Size**: ${(analysis.totalSize / 1024).toFixed(1)} KB
- **Gzipped Size**: ${(analysis.gzippedSize / 1024).toFixed(1)} KB
- **Compression Ratio**: ${((analysis.gzippedSize / analysis.totalSize) * 100).toFixed(1)}%

## Chunks
${analysis.chunks.map(chunk => `
### ${chunk.name}
- Size: ${(chunk.size / 1024).toFixed(1)} KB
- Gzipped: ${(chunk.gzippedSize / 1024).toFixed(1)} KB
- Type: ${chunk.isAsync ? 'Async' : 'Sync'}
- Modules: ${chunk.modules.length}
`).join('')}

## Dependencies
${analysis.dependencies.map(dep => `
- **${dep.name}** (${dep.version}): ${(dep.size / 1024).toFixed(1)} KB
${dep.alternatives ? `  - Alternatives: ${dep.alternatives.join(', ')}` : ''}
`).join('')}

## Issues Found
${analysis.duplicates.length > 0 ? `
### Duplicate Dependencies
${analysis.duplicates.map(dup => `
- **${dup.name}**: ${dup.versions.join(', ')} (${(dup.totalSize / 1024).toFixed(1)} KB wasted)
`).join('')}
` : ''}

${analysis.unusedExports.length > 0 ? `
### Unused Exports
${analysis.unusedExports.map(exp => `
- **${exp.module}**: ${exp.exports.join(', ')} (~${(exp.potentialSavings / 1024).toFixed(1)} KB)
`).join('')}
` : ''}

## Recommendations
${recommendations.map(rec => `- ${rec}`).join('\n')}

---
Generated on ${new Date().toISOString()}
    `.trim();
  }

  // Tree shaking analysis
  analyzeTreeShaking(): {
    totalExports: number;
    usedExports: number;
    unusedExports: number;
    shakeableModules: string[];
  } {
    // Mock tree shaking analysis
    return {
      totalExports: 1250,
      usedExports: 890,
      unusedExports: 360,
      shakeableModules: [
        'lodash',
        'moment',
        'react-native-vector-icons',
        './src/utils/helpers.ts',
      ],
    };
  }

  // Code splitting recommendations
  getCodeSplittingRecommendations(): {
    routeBasedSplits: string[];
    featureBasedSplits: string[];
    vendorSplits: string[];
  } {
    return {
      routeBasedSplits: [
        'screens/recipe/*',
        'screens/premium/*',
        'screens/community/*',
        'screens/settings/*',
      ],
      featureBasedSplits: [
        'components/premium/*',
        'components/cookingMode/*',
        'services/paymentProcessor.ts',
        'utils/imageOptimizer.ts',
      ],
      vendorSplits: [
        'react-native-vector-icons',
        '@reduxjs/toolkit',
        'react-native-paper',
        'react-native-reanimated',
      ],
    };
  }

  // Performance budget checker
  checkPerformanceBudget(analysis: BundleAnalysis): {
    passed: boolean;
    violations: string[];
    budgets: {
      totalSize: { limit: number; current: number; passed: boolean };
      gzippedSize: { limit: number; current: number; passed: boolean };
      chunkSize: { limit: number; violations: string[] };
    };
  } {
    const budgets = {
      totalSize: { limit: 2000000, current: analysis.totalSize, passed: false }, // 2MB
      gzippedSize: { limit: 500000, current: analysis.gzippedSize, passed: false }, // 500KB
      chunkSize: { limit: 250000, violations: [] as string[] }, // 250KB per chunk
    };

    budgets.totalSize.passed = budgets.totalSize.current <= budgets.totalSize.limit;
    budgets.gzippedSize.passed = budgets.gzippedSize.current <= budgets.gzippedSize.limit;

    analysis.chunks.forEach(chunk => {
      if (chunk.size > budgets.chunkSize.limit) {
        budgets.chunkSize.violations.push(
          `${chunk.name}: ${(chunk.size / 1024).toFixed(1)}KB`
        );
      }
    });

    const violations: string[] = [];
    if (!budgets.totalSize.passed) {
      violations.push(
        `Total bundle size exceeds limit: ${(budgets.totalSize.current / 1024).toFixed(1)}KB > ${(budgets.totalSize.limit / 1024).toFixed(1)}KB`
      );
    }
    if (!budgets.gzippedSize.passed) {
      violations.push(
        `Gzipped bundle size exceeds limit: ${(budgets.gzippedSize.current / 1024).toFixed(1)}KB > ${(budgets.gzippedSize.limit / 1024).toFixed(1)}KB`
      );
    }
    if (budgets.chunkSize.violations.length > 0) {
      violations.push(`Large chunks: ${budgets.chunkSize.violations.join(', ')}`);
    }

    return {
      passed: violations.length === 0,
      violations,
      budgets,
    };
  }
}

// Singleton instance
export const bundleOptimizer = BundleOptimizerService.getInstance();

// React hook for bundle analysis
export const useBundleAnalysis = () => {
  const [analysis, setAnalysis] = React.useState<BundleAnalysis | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const runAnalysis = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await bundleOptimizer.analyzeBundleSize();
      setAnalysis(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (__DEV__) {
      runAnalysis();
    }
  }, [runAnalysis]);

  return {
    analysis,
    isLoading,
    error,
    runAnalysis,
    getRecommendations: analysis 
      ? () => bundleOptimizer.getOptimizationRecommendations(analysis)
      : () => [],
    generateReport: analysis
      ? () => bundleOptimizer.generateBundleReport(analysis)
      : () => '',
  };
};

// Webpack configuration helpers
export const createOptimizedWebpackConfig = () => {
  return {
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          async: {
            chunks: 'async',
            name: 'async-components',
            priority: 1,
          },
        },
      },
      usedExports: true,
      sideEffects: false,
      minimize: true,
      minimizer: [
        // TerserPlugin configuration would go here
      ],
    },
    resolve: {
      alias: {
        // Add aliases to reduce bundle size
        'lodash': 'lodash-es',
        'moment': 'dayjs',
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { modules: false }],
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: [
                '@babel/plugin-syntax-dynamic-import',
                ['import', { libraryName: 'lodash', libraryDirectory: '', camel2DashComponentName: false }, 'lodash'],
              ],
            },
          },
        },
      ],
    },
  };
};

// Metro configuration for React Native
export const createOptimizedMetroConfig = () => {
  return {
    transformer: {
      minifierConfig: {
        keep_fnames: true,
        mangle: {
          keep_fnames: true,
        },
      },
    },
    resolver: {
      alias: {
        'lodash': 'lodash-es',
      },
    },
    serializer: {
      createModuleIdFactory: () => (path: string) => {
        // Create stable module IDs for better caching
        return require('crypto').createHash('md5').update(path).digest('hex').substr(0, 8);
      },
    },
  };
};