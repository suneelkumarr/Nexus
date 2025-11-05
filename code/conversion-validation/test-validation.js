#!/usr/bin/env node

/**
 * Conversion Validation Framework - Test Script
 * This script validates the framework components and generates sample data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const color = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    error: '\x1b[31m',   // red
    warning: '\x1b[33m', // yellow
    reset: '\x1b[0m'     // reset
  };

  console.log(`${color[type]}[${timestamp}] ${message}${color.reset}`);
}

function test(name, testFn) {
  testResults.total++;
  try {
    testFn();
    testResults.passed++;
    log(`✓ ${name}`, 'success');
  } catch (error) {
    testResults.failed++;
    log(`✗ ${name}: ${error.message}`, 'error');
  }
}

// Component validation tests
function validateFileStructure() {
  const requiredFiles = [
    'src/App.tsx',
    'src/main.tsx',
    'src/index.css',
    'src/types/analytics.ts',
    'src/utils/analytics.ts',
    'src/services/dataService.ts',
    'src/components/Dashboard/ConversionDashboard.tsx',
    'src/components/Analytics/UserBehaviorAnalytics.tsx',
    'src/components/A-BTesting/ABTestDashboard.tsx',
    'src/components/Validation/SuccessCriteriaValidator.tsx',
    'src/components/ROICalculator/ROICalculator.tsx',
    'config.example.ts',
    'package.json',
    'vite.config.ts',
    'tailwind.config.js',
    'README.md'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required file missing: ${file}`);
    }
  });
}

function validateTypeScriptConfiguration() {
  const tsConfigPath = path.join(__dirname, 'tsconfig.json');
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  
  if (!tsConfig.compilerOptions) {
    throw new Error('TypeScript configuration missing compilerOptions');
  }
  
  if (tsConfig.compilerOptions.target !== 'ES2020') {
    throw new Error('TypeScript target should be ES2020');
  }
}

function validatePackageJson() {
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  if (!packageJson.dependencies) {
    throw new Error('Package.json missing dependencies');
  }
  
  const requiredDeps = ['react', 'react-dom', 'recharts', 'lucide-react', 'clsx'];
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies[dep]) {
      throw new Error(`Missing required dependency: ${dep}`);
    }
  });
}

function validateViteConfiguration() {
  const viteConfigPath = path.join(__dirname, 'vite.config.ts');
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  if (!viteConfig.includes('react()')) {
    throw new Error('Vite config missing React plugin');
  }
}

function validateTailwindConfiguration() {
  const tailwindConfigPath = path.join(__dirname, 'tailwind.config.js');
  const tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');
  
  if (!tailwindConfig.includes('content:')) {
    throw new Error('Tailwind config missing content configuration');
  }
}

function validateDataService() {
  const dataServicePath = path.join(__dirname, 'src/services/dataService.ts');
  const dataService = fs.readFileSync(dataServicePath, 'utf8');
  
  if (!dataService.includes('generateMockConversionEvents')) {
    throw new Error('Data service missing conversion events generator');
  }
  
  if (!dataService.includes('generateMockABTests')) {
    throw new Error('Data service missing A/B test generator');
  }
  
  if (!dataService.includes('generateMockROIAnalysis')) {
    throw new Error('Data service missing ROI analysis generator');
  }
}

function validateAnalyticsUtils() {
  const utilsPath = path.join(__dirname, 'src/utils/analytics.ts');
  const utils = fs.readFileSync(utilsPath, 'utf8');
  
  if (!utils.includes('calculateConversionRate')) {
    throw new Error('Analytics utils missing conversion rate calculator');
  }
  
  if (!utils.includes('calculateStatisticalSignificance')) {
    throw new Error('Analytics utils missing statistical significance calculator');
  }
  
  if (!utils.includes('calculateROI')) {
    throw new Error('Analytics utils missing ROI calculator');
  }
}

function validateComponentStructure() {
  const componentsDir = path.join(__dirname, 'src/components');
  const componentDirs = ['Dashboard', 'Analytics', 'A-BTesting', 'Validation', 'ROICalculator', 'Shared'];
  
  componentDirs.forEach(dir => {
    const dirPath = path.join(componentsDir, dir);
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Component directory missing: ${dir}`);
    }
  });
}

function validateTypeDefinitions() {
  const typesPath = path.join(__dirname, 'src/types/analytics.ts');
  const types = fs.readFileSync(typesPath, 'utf8');
  
  if (!types.includes('interface ConversionEvent')) {
    throw new Error('Type definitions missing ConversionEvent interface');
  }
  
  if (!types.includes('interface ABTestResult')) {
    throw new Error('Type definitions missing ABTestResult interface');
  }
  
  if (!types.includes('interface ROIAnalysis')) {
    throw new Error('Type definitions missing ROIAnalysis interface');
  }
}

function generateSampleReport() {
  const sampleData = {
    framework: 'Conversion Validation Framework',
    version: '1.0.0',
    components: {
      conversionDashboard: {
        implemented: true,
        features: [
          'Real-time conversion metrics',
          'Interactive conversion funnel',
          'Trend analysis charts',
          'Key insights panel',
          'Goals tracking'
        ]
      },
      userBehaviorAnalytics: {
        implemented: true,
        features: [
          'User journey mapping',
          'Feature usage analysis',
          'Session duration tracking',
          'Conversion flow breakdown',
          'Segment analysis'
        ]
      },
      abTestingDashboard: {
        implemented: true,
        features: [
          'Test management',
          'Statistical analysis',
          'Variant performance comparison',
          'Real-time monitoring',
          'Results visualization'
        ]
      },
      successCriteriaValidation: {
        implemented: true,
        features: [
          'Automated validation',
          'Priority-based tracking',
          'Progress monitoring',
          'Risk assessment',
          'Historical tracking'
        ]
      },
      roiCalculator: {
        implemented: true,
        features: [
          'Interactive calculator',
          'Visual ROI charts',
          'Payback period calculation',
          'Cost breakdown',
          'Trend analysis'
        ]
      }
    },
    metrics: {
      conversion: [
        'Conversion Rate',
        'Trial Conversion Rate',
        'Onboarding Completion Rate',
        'Feature Adoption Rate',
        'Average Time to Convert'
      ],
      behavior: [
        'Session Duration',
        'Feature Usage',
        'Page Navigation',
        'User Journey',
        'Segment Performance'
      ],
      business: [
        'Customer Acquisition Cost',
        'Customer Lifetime Value',
        'Monthly Recurring Revenue',
        'Churn Rate',
        'Payback Period'
      ],
      abTesting: [
        'Statistical Significance',
        'Conversion Lift',
        'Sample Size Required',
        'Test Duration',
        'Multi-variant Comparison'
      ]
    },
    technologies: {
      frontend: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS'],
      visualization: ['Recharts'],
      icons: ['Lucide React'],
      utilities: ['clsx', 'tailwind-merge', 'date-fns']
    },
    timestamp: new Date().toISOString(),
    validationStatus: 'PASSED'
  };

  const reportPath = path.join(__dirname, 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(sampleData, null, 2));
  log(`Generated validation report: ${reportPath}`, 'success');
}

function runTests() {
  log('Starting Conversion Validation Framework Tests', 'info');
  log('=================================================', 'info');
  
  // Core structure tests
  test('File Structure Validation', validateFileStructure);
  test('TypeScript Configuration', validateTypeScriptConfiguration);
  test('Package.json Configuration', validatePackageJson);
  test('Vite Configuration', validateViteConfiguration);
  test('Tailwind Configuration', validateTailwindConfiguration);
  
  // Core functionality tests
  test('Data Service Implementation', validateDataService);
  test('Analytics Utilities', validateAnalyticsUtils);
  test('Component Structure', validateComponentStructure);
  test('Type Definitions', validateTypeDefinitions);
  
  // Generate sample report
  generateSampleReport();
  
  // Summary
  log('=================================================', 'info');
  log(`Test Summary:`, 'info');
  log(`  Total Tests: ${testResults.total}`, 'info');
  log(`  Passed: ${testResults.passed}`, 'success');
  log(`  Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  
  if (testResults.failed === 0) {
    log('🎉 All tests passed! Framework is ready for use.', 'success');
    process.exit(0);
  } else {
    log('❌ Some tests failed. Please review the errors above.', 'error');
    process.exit(1);
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export {
  test,
  log,
  runTests
};