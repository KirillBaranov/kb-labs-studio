## [0.2.0] - 2026-03-02

> **@kb-labs/studio** 0.1.0 → 0.2.0 (minor: new features)

### ✨ New Features

- **agents**: Introduces new agent components that enhance the user interface, making it more intuitive and visually appealing.
- **agents**: Adds additional components for agents functionality, improving the overall user experience and feature accessibility.
- **studio**: Launches a new studio UI kit package, providing designers and developers with a cohesive set of tools for building applications.
- **studio**: Enhances the plugins module, allowing for more seamless integration and better performance of third-party functionalities.
- **studio**: Introduces module-specific routing to improve navigation and organization within the studio application.
- **studio**: Adds routing infrastructure that supports better user flow and accessibility across different application sections.
- **studio**: Implements a new layout system that allows for more flexible and responsive design options.
- **ui-kit**: Creates a design system using Ant Design tokens, ensuring consistent styling and branding across the application.
- **workflow-ui**: Adds new workflow components to the application, facilitating smoother project management and task tracking.
- **quality**: Introduces quality management components and pages, helping users maintain high standards and efficiency in their processes.
- **assistant**: Adds an assistant page and styles, improving user guidance and support within the application.
- **observability**: Introduces new observability widgets for monitoring system resources and incidents, enhancing real-time insights and issue resolution.
- **observability**: Adds a log detail page component, enabling users to delve deeper into logs for better troubleshooting capabilities.
- **dashboard**: Integrates an AI insights page into the dashboard, providing users with valuable data-driven recommendations.
- **dashboard**: Introduces a new time travel widget, allowing users to visualize changes over time and make informed decisions.
- **dashboard**: Adds an industry benchmark widget, enabling users to compare their metrics against industry standards for improved performance analysis.
- **dashboard**: Introduces a chaos engineering widget, helping users assess the resilience of their systems under unexpected conditions.
- **dashboard**: Adds a new AI insights widget, offering users tailored analytics and suggestions based on their data.
- **documentation**: Provides an intelligence dashboard implementation plan, assisting users in understanding how to utilize new features effectively.
- **studio**: Adds markdown components for release notes, enabling better communication of updates and changes to users.
- **ui**: Introduces a new diff viewer component, allowing users to easily compare changes and revisions in their content.
- **data-client**: Adds hooks and mocks

### 🐛 Bug Fixes

- **general**: Removes outdated use-agents hook, ensuring the application runs smoothly without relying on deprecated features.
- **lint**: Resolves remaining ESLint errors, enhancing code quality and maintainability for future development.
- **lint**: Addresses ESLint errors across kb-labs-studio, contributing to a cleaner codebase and better performance.
- **lint**: Adds curly braces to if statements, promoting consistency in the code and reducing potential errors.
- **config**: Corrects the tsup import extension and updates configurations, improving build reliability for developers.
- **types**: Fixes action types and contracts for consistency, ensuring that components interact correctly and reducing bugs.
- **table**: Measures actual pagination height for accurate scroll calculation, enhancing user experience by providing a smoother scrolling experience.
- **table**: Utilizes ResizeObserver to dynamically calculate scroll height, allowing for better handling of layout changes during use.
- **table**: Improves scroll height calculation to accurately show pagination, ensuring users can navigate through data effortlessly.
- **layout**: Limits widget height to prevent page overflow, creating a more visually appealing and navigable interface.
- **router**: Moves WidgetModalManager inside Router context, improving the organization of components and streamlining navigation.
- **data-client**: Fixes NotReadyResponse type assertion, ensuring that users receive accurate feedback when the system is not ready.
- **ui-react**: Aligns AliasToken usage with antd, promoting consistency in UI components for a more cohesive user experience.
- **docs**: Updates Last Updated date to November 2025, providing users with accurate information on document currency.
- **docs**: Corrects a typo in the ADR filename, ensuring clarity and professionalism in documentation.
- **studio**: Fixes EmptyState to support icon components, enhancing visual communication when no data is available.
- **ui-react**: Fixes table styling with CSS variables, improving visual consistency and performance across different themes.
- **studio**: Moves StudioNav inside Router context, enhancing navigation and improving the overall user experience.