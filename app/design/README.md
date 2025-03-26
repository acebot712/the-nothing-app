# The Nothing App Design System

This design system provides consistent UI components and design tokens for The Nothing App.

## Getting Started

Import components and the theme from the design system:

```tsx
import { theme, Button, Card, Text } from '../design';
```

## Theme

The theme contains design tokens for:

- Colors
- Typography
- Spacing
- Border Radius
- Elevation (shadows)
- Z-Index
- Animations
- Breakpoints

Example usage:

```tsx
import { theme } from '../design';

// Use in styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.ui.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
});
```

## Components

### Avatar

Display user avatars or placeholders.

```tsx
<Avatar 
  source="https://example.com/avatar.jpg"
  size="md"
  status="online"
  name="John Doe"
  premium={true}
/>
```

### Badge

Display user tier badges.

```tsx
<Badge tier="elite" size="md" />
```

### Button

Clickable buttons with various styles.

```tsx
<Button 
  title="Get Started"
  variant="primary"
  size="md"
  onPress={() => {}}
  leftIcon={<Icon name="arrow-right" />}
/>
```

Available variants: `primary`, `secondary`, `tertiary`, `ghost`, `danger`, `gold`

### Card

Container for content with various styles.

```tsx
<Card 
  variant="elevated"
  padding="lg"
  onPress={() => {}}
>
  <Text>Card content</Text>
</Card>
```

### Container

Layout container with optional safe area and gradient.

```tsx
<Container 
  useSafeArea
  useGradient
  center
>
  <Text>Container content</Text>
</Container>
```

### Divider

Visual separator with optional label.

```tsx
<Divider />

<Divider 
  label="OR"
  labelPosition="center"
  size="medium"
/>
```

### Input

Text input field with validation states.

```tsx
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  leftIcon={<Icon name="mail" />}
/>
```

### Loader

Loading indicators with animations.

```tsx
<Loader 
  type="spinner"
  size="large"
  text="Loading..."
/>
```

### Modal

Popup dialogs with various positions.

```tsx
<Modal
  visible={isVisible}
  onClose={() => setIsVisible(false)}
  position="center"
>
  <Text>Modal content</Text>
</Modal>
```

### Text

Typography component with proper styling.

```tsx
<Text 
  variant="h1"
  color="primary"
  align="center"
  weight="bold"
>
  Heading Text
</Text>
```

## Best Practices

1. Always use the design system components instead of native components directly
2. Use theme tokens for spacing, colors, typography, etc.
3. Avoid hardcoding values that are available in the theme
4. Maintain consistency by using the appropriate component variants
5. Use composition of design system components to create complex UI patterns 