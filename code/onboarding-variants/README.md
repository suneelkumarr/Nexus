# Onboarding A/B Test Variants

A comprehensive collection of React components for testing different onboarding flow approaches. This project implements various A/B test variants to optimize user onboarding experiences for Instagram growth tools.

## 🚀 Overview

This project contains 5 main test categories with multiple variants:

1. **Interactive Guided Tour vs Self-Exploration**
2. **Feature-Focused vs Benefit-Focused Messaging** 
3. **Progressive Disclosure vs Full Feature Showcase**
4. **Social Proof Placement Variants**
5. **CTA Timing and Positioning Tests**

## 📁 Project Structure

```
src/
├── components/
│   ├── ui.tsx                 # Base UI components (Button, Card, Badge)
│   ├── ProgressIndicator.tsx  # Progress tracking component
│   ├── SocialProof.tsx        # Social proof display components
│   ├── GuidedTour.tsx         # Interactive tour variant
│   ├── SelfExploration.tsx    # Self-directed exploration
│   ├── FeatureFocused.tsx     # Technical features emphasis
│   ├── BenefitFocused.tsx     # Outcomes and benefits emphasis
│   ├── ProgressiveDisclosure.tsx # Step-by-step reveal
│   ├── FullShowcase.tsx       # All features at once
│   ├── SocialProofPlacement.tsx # Social proof positioning tests
│   ├── CTAPositioning.tsx     # Call-to-action placement tests
│   └── index.ts              # Component exports
├── lib/
│   └── utils.ts              # Utility functions and constants
├── types.ts                  # TypeScript interfaces
├── App.tsx                   # Main application component
├── App.css                   # Custom styles and animations
└── main.tsx                  # Application entry point
```

## 🧪 Test Categories

### 1. Interaction Style Tests

#### Guided Tour vs Self-Exploration
- **GuidedTour**: Interactive step-by-step tour with auto-play capabilities
- **SelfExploration**: Users explore features at their own pace with free navigation

**Key Differences:**
- Guided tour has structured progression with "Next/Previous" buttons
- Self-exploration allows free navigation between sections
- Guided tour includes auto-play functionality
- Self-exploration shows progress tracking based on exploration

### 2. Messaging Strategy Tests

#### Feature-Focused vs Benefit-Focused
- **FeatureFocused**: Emphasizes technical features and specifications
- **BenefitFocused**: Focuses on outcomes and value users will achieve

**Key Differences:**
- Feature-focused includes technical specs, metrics, and capabilities
- Benefit-focused highlights results, outcomes, and user transformations
- Feature-focused uses detailed checklists and specifications
- Benefit-focused uses success stories and quantified results

### 3. Content Disclosure Tests

#### Progressive Disclosure vs Full Showcase
- **ProgressiveDisclosure**: Information revealed gradually as users progress
- **FullShowcase**: All features displayed simultaneously

**Key Differences:**
- Progressive shows one section at a time with reveal animations
- Full showcase displays everything at once in a grid or tabs
- Progressive builds curiosity and engagement over time
- Full showcase gives complete overview immediately

### 4. Social Proof Placement Tests

Different positioning strategies for testimonials and user feedback:
- **Top**: Social proof appears at the beginning
- **Middle**: Social proof integrated in content flow
- **Bottom**: Social proof appears at the end
- **Floating**: Social proof positioned as side elements
- **Multiple**: Social proof distributed throughout

### 5. Call-to-Action Tests

Different timing and positioning strategies:
- **Early**: CTA appears after 30% progress
- **Balanced**: CTA appears after 60% progress  
- **Late**: CTA appears only at completion

CTA styles:
- **Prominent**: Large, eye-catching buttons with animations
- **Subtle**: Minimal, understated CTA elements
- **Progressive**: Multiple CTAs with different urgency levels
- **Contextual**: CTAs tailored to specific content sections

## 🎨 Design System

### Colors
- **Primary**: Blue (#2563eb)
- **Secondary**: Gray scale
- **Success**: Green (#16a34a)
- **Warning**: Yellow (#ca8a04)
- **Error**: Red (#dc2626)

### Typography
- **Font Family**: Inter (with fallbacks)
- **Headings**: Bold, large scale
- **Body**: Regular weight, readable size
- **Captions**: Smaller, muted color

### Animations
- **Fade In**: 0.5s ease-in-out
- **Slide In**: From bottom/left/right, 0.5s ease-out
- **Zoom In**: 0.3s ease-out
- **Hover Effects**: Subtle transforms and shadows

## 🛠 Usage

### Running the Development Server

```bash
npm install
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview
```

### Component Usage Examples

```tsx
import { GuidedTour } from './components';

// Basic usage
<GuidedTour 
  steps={onboardingSteps}
  onComplete={handleComplete}
  showSocialProof={true}
  showProgress={true}
  autoAdvance={false}
/>

// With custom props
<BenefitFocused
  steps={onboardingSteps}
  onComplete={handleComplete}
  showSocialProof={true}
  emphasizeOutcomes={true}
/>

<CTAPositioning
  steps={onboardingSteps}
  onComplete={handleComplete}
  positioning="balanced"
  ctaStyle="prominent"
  showProgress={true}
/>
```

## 📊 Metrics to Track

### Engagement Metrics
- Time spent on each variant
- Step completion rates
- Feature interaction patterns
- Drop-off points

### Conversion Metrics
- CTA click-through rates
- Trial signup rates
- User activation rates
- Retention after onboarding

### Qualitative Metrics
- User satisfaction scores
- Feature comprehension
- User preference feedback
- Support ticket reduction

## 🔧 Customization

### Adding New Variants

1. Create new component in `src/components/`
2. Add configuration to `variantConfigs` in `App.tsx`
3. Update type definitions in `types.ts`
4. Add to component exports in `index.ts`

### Styling Customization

Modify `tailwind.config.js` for:
- Color schemes
- Typography scale
- Animation timing
- Spacing system

### Content Customization

Update `DEFAULT_STEPS` in `types.ts` with:
- Step titles and descriptions
- Feature lists
- Benefits descriptions
- Social proof content

## 🎯 Testing Strategy

### A/B Testing Implementation

1. **Random Assignment**: Randomly assign users to variants
2. **Traffic Splitting**: 50/50 or weighted splits for comparison
3. **Statistical Significance**: Run tests until statistical significance
4. **Duration**: Minimum 1-2 weeks for reliable results

### Data Collection

```javascript
// Example tracking events
trackEvent('onboarding_started', { variant: 'guided_tour' });
trackEvent('step_completed', { step: 1, variant: 'guided_tour' });
trackEvent('cta_clicked', { position: 'header', variant: 'guided_tour' });
trackEvent('onboarding_completed', { variant: 'guided_tour' });
```

## 📱 Responsive Design

All variants are fully responsive with:
- Mobile-first approach
- Touch-friendly interactions
- Adaptive layouts for tablets
- Optimized for desktop viewing

## 🌐 Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is created for testing and educational purposes.

## 🤝 Contributing

1. Create feature branches from main
2. Follow existing code style and patterns
3. Add tests for new functionality
4. Update documentation as needed

---

Built with React, TypeScript, Tailwind CSS, and Vite for optimal development experience.