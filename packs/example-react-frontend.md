# Pack: example/react-frontend@v1

A sample pack for React + TypeScript frontend projects.

## Metadata

```yaml
id: example/react-frontend
version: 1
description: Constraints for React + TypeScript frontend development
applies_when:
  languages: [typescript, javascript]
  paths: ["src/components/**", "src/pages/**", "src/hooks/**"]
```

## Rules

```yaml
rules:
  - id: USE_FUNCTIONAL_COMPONENTS
    text: "Use functional components with hooks. Avoid class components unless integrating with legacy code."
    applies_when:
      paths: ["src/components/**", "src/pages/**"]

  - id: COLOCATE_STYLES
    text: "Colocate styles with components (CSS modules, styled-components, or Tailwind). No global CSS for component-specific styles."
    applies_when:
      paths: ["src/components/**"]

  - id: EXTRACT_CUSTOM_HOOKS
    text: "Extract reusable logic into custom hooks (useXxx). Keep components focused on rendering."
    applies_when:
      paths: ["src/components/**", "src/pages/**"]

  - id: MEMOIZE_EXPENSIVE_RENDERS
    text: "Use React.memo, useMemo, and useCallback for expensive computations and to prevent unnecessary re-renders."
    applies_when:
      paths: ["src/components/**"]

  - id: HANDLE_LOADING_ERROR_STATES
    text: "Always handle loading, error, and empty states in components that fetch data."
    applies_when:
      paths: ["src/components/**", "src/pages/**"]

  - id: ACCESSIBLE_COMPONENTS
    text: "Use semantic HTML, proper ARIA attributes, and keyboard navigation. Test with screen readers."
    applies_when:
      paths: ["src/components/**"]

  - id: TEST_USER_INTERACTIONS
    text: "Test components from the user's perspective using React Testing Library. Avoid testing implementation details."
    applies_when:
      paths: ["src/components/**", "**/*.test.tsx"]
```

## Usage

```text
&pack example/react-frontend@v1
```
