/**
 * Analyze Ant Design theme tokens and compare with our theme-adapter
 *
 * This script:
 * 1. Extracts all available Ant Design tokens from type definitions
 * 2. Compares with tokens defined in theme-adapter.ts
 * 3. Reports missing tokens
 * 4. Suggests which tokens should be mapped to CSS variables
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read our theme adapter
const themeAdapterPath = path.join(__dirname, '../packages/studio-ui-react/src/lib/theme-adapter.ts');
const themeAdapterContent = fs.readFileSync(themeAdapterPath, 'utf-8');

// Extract token assignments from theme-adapter
function extractDefinedTokens(content: string): Set<string> {
  const tokens = new Set<string>();

  // Match patterns like: colorPrimary: 'var(--xxx)',
  const tokenRegex = /^\s+(\w+):\s*['"`]/gm;
  let match;

  while ((match = tokenRegex.exec(content)) !== null) {
    tokens.add(match[1]);
  }

  return tokens;
}

// Known Ant Design seed/alias tokens (from TypeScript definitions)
const antdSeedTokens = [
  // Primary colors
  'colorPrimary',
  'colorSuccess',
  'colorWarning',
  'colorError',
  'colorInfo',

  // Neutral colors
  'colorTextBase',
  'colorBgBase',

  // Font
  'fontSize',
  'fontFamily',
  'fontSizeHeading1',
  'fontSizeHeading2',
  'fontSizeHeading3',
  'fontSizeHeading4',
  'fontSizeHeading5',

  // Layout
  'borderRadius',
  'sizeUnit',
  'sizeStep',
  'wireframe',
];

const antdAliasTokens = [
  // Backgrounds
  'colorBgContainer',
  'colorBgElevated',
  'colorBgLayout',
  'colorBgSpotlight',
  'colorBgMask',
  'colorBgBase',
  'colorBgTextHover',
  'colorBgTextActive',
  'colorBgContainerDisabled',

  // Fills
  'colorFill',
  'colorFillSecondary',
  'colorFillTertiary',
  'colorFillQuaternary',
  'colorFillContent',
  'colorFillContentHover',
  'colorFillAlter',

  // Borders
  'colorBorder',
  'colorBorderBg',
  'colorBorderSecondary',
  'colorSplit',

  // Text
  'colorText',
  'colorTextSecondary',
  'colorTextTertiary',
  'colorTextQuaternary',
  'colorTextDisabled',
  'colorTextHeading',
  'colorTextLabel',
  'colorTextDescription',
  'colorTextPlaceholder',
  'colorTextLightSolid',

  // Primary
  'colorPrimaryBg',
  'colorPrimaryBgHover',
  'colorPrimaryBorder',
  'colorPrimaryBorderHover',
  'colorPrimaryHover',
  'colorPrimaryActive',
  'colorPrimaryTextHover',
  'colorPrimaryText',
  'colorPrimaryTextActive',

  // Success
  'colorSuccessBg',
  'colorSuccessBgHover',
  'colorSuccessBorder',
  'colorSuccessBorderHover',
  'colorSuccessHover',
  'colorSuccessActive',
  'colorSuccessTextHover',
  'colorSuccessText',
  'colorSuccessTextActive',

  // Warning
  'colorWarningBg',
  'colorWarningBgHover',
  'colorWarningBorder',
  'colorWarningBorderHover',
  'colorWarningHover',
  'colorWarningActive',
  'colorWarningTextHover',
  'colorWarningText',
  'colorWarningTextActive',
  'colorWarningOutline',

  // Error
  'colorErrorBg',
  'colorErrorBgHover',
  'colorErrorBorder',
  'colorErrorBorderHover',
  'colorErrorHover',
  'colorErrorActive',
  'colorErrorTextHover',
  'colorErrorText',
  'colorErrorTextActive',
  'colorErrorOutline',

  // Info
  'colorInfoBg',
  'colorInfoBgHover',
  'colorInfoBorder',
  'colorInfoBorderHover',
  'colorInfoHover',
  'colorInfoActive',
  'colorInfoTextHover',
  'colorInfoText',
  'colorInfoTextActive',

  // Links
  'colorLink',
  'colorLinkHover',
  'colorLinkActive',

  // Icons
  'colorIcon',
  'colorIconHover',

  // Highlight
  'colorHighlight',

  // Control (inputs, buttons, etc.)
  'controlOutline',
  'controlOutlineWidth',
  'controlItemBgHover',
  'controlItemBgActive',
  'controlItemBgActiveHover',
  'controlItemBgActiveDisabled',
  'controlTmpOutline',
  'controlInteractiveSize',

  // Box shadow
  'boxShadow',
  'boxShadowSecondary',
  'boxShadowTertiary',

  // Typography
  'fontSizeLG',
  'fontSizeSM',
  'fontSizeXL',
  'fontSizeIcon',
  'fontWeightStrong',
  'lineHeight',
  'lineHeightLG',
  'lineHeightSM',
  'lineHeightHeading1',
  'lineHeightHeading2',
  'lineHeightHeading3',
  'lineHeightHeading4',
  'lineHeightHeading5',

  // Spacing
  'padding',
  'paddingXS',
  'paddingSM',
  'paddingLG',
  'paddingXL',
  'paddingXXS',
  'margin',
  'marginXS',
  'marginSM',
  'marginLG',
  'marginXL',
  'marginXXS',

  // Control heights
  'controlHeight',
  'controlHeightSM',
  'controlHeightLG',
  'controlHeightXS',

  // Border radius
  'borderRadiusLG',
  'borderRadiusSM',
  'borderRadiusXS',
  'borderRadiusOuter',

  // Motion
  'motionUnit',
  'motionBase',
  'motionEaseInOut',
  'motionEaseInOutCirc',
  'motionEaseOut',
  'motionEaseOutCirc',
  'motionEaseIn',
  'motionEaseInCirc',
  'motionEaseInBack',
  'motionEaseOutBack',
  'motionEaseInOutBack',
  'motionEaseInQuint',
  'motionEaseOutQuint',
  'motionDurationFast',
  'motionDurationMid',
  'motionDurationSlow',

  // Screen sizes
  'screenXS',
  'screenXSMin',
  'screenXSMax',
  'screenSM',
  'screenSMMin',
  'screenSMMax',
  'screenMD',
  'screenMDMin',
  'screenMDMax',
  'screenLG',
  'screenLGMin',
  'screenLGMax',
  'screenXL',
  'screenXLMin',
  'screenXLMax',
  'screenXXL',
  'screenXXLMin',

  // Z-index
  'zIndexBase',
  'zIndexPopupBase',
];

// Component-specific tokens (examples for Card, Button, Table, etc.)
const componentTokens: Record<string, string[]> = {
  Card: [
    'headerBg',
    'headerFontSize',
    'headerFontSizeSM',
    'headerHeight',
    'headerHeightSM',
    'bodyPadding',
    'bodyPaddingSM',
    'headerPadding',
    'headerPaddingSM',
    'actionsBg',
    'actionsLiMargin',
    'tabsMarginBottom',
    'extraColor',
    // Plus inherits all alias tokens like colorText, colorBorder, etc.
  ],
  Button: [
    'contentFontSize',
    'contentFontSizeLG',
    'contentFontSizeSM',
    'defaultBg',
    'defaultBorderColor',
    'defaultColor',
    'defaultGhostBorderColor',
    'defaultGhostColor',
    'defaultHoverBg',
    'defaultHoverBorderColor',
    'defaultHoverColor',
    'defaultShadow',
    'dangerColor',
    'dangerShadow',
    'primaryColor',
    'primaryShadow',
    'textHoverBg',
  ],
  Table: [
    'headerBg',
    'headerColor',
    'headerSortActiveBg',
    'headerSortHoverBg',
    'bodySortBg',
    'rowHoverBg',
    'rowSelectedBg',
    'rowSelectedHoverBg',
    'rowExpandedBg',
    'cellPaddingBlock',
    'cellPaddingInline',
    'cellPaddingBlockMD',
    'cellPaddingInlineMD',
    'cellPaddingBlockSM',
    'cellPaddingInlineSM',
    'borderColor',
    'headerBorderRadius',
    'headerSplitColor',
    'fixedHeaderSortActiveBg',
    'footerBg',
    'footerColor',
    'cellFontSize',
    'cellFontSizeMD',
    'cellFontSizeSM',
    'filterDropdownMenuBg',
    'filterDropdownBg',
    'expandIconBg',
    'selectionColumnWidth',
    'stickyScrollBarBg',
    'stickyScrollBarBorderRadius',
  ],
};

// Analyze
const definedTokens = extractDefinedTokens(themeAdapterContent);
const allAntdTokens = [...antdSeedTokens, ...antdAliasTokens];

console.log('📊 Ant Design Theme Token Analysis\n');
console.log(`Total Ant Design tokens: ${allAntdTokens.length}`);
console.log(`Tokens defined in theme-adapter: ${definedTokens.size}\n`);

// Find missing tokens
const missingTokens = allAntdTokens.filter(token => !definedTokens.has(token));

if (missingTokens.length > 0) {
  console.log(`⚠️  Missing ${missingTokens.length} tokens in theme-adapter:\n`);

  // Group by category
  const colorTokens = missingTokens.filter(t => t.startsWith('color'));
  const fontTokens = missingTokens.filter(t => t.startsWith('font') || t.startsWith('lineHeight'));
  const sizeTokens = missingTokens.filter(t => t.includes('Size') || t.includes('Height') || t.includes('Width'));
  const spacingTokens = missingTokens.filter(t => t.startsWith('padding') || t.startsWith('margin'));
  const motionTokens = missingTokens.filter(t => t.startsWith('motion'));
  const screenTokens = missingTokens.filter(t => t.startsWith('screen'));
  const otherTokens = missingTokens.filter(t =>
    !colorTokens.includes(t) &&
    !fontTokens.includes(t) &&
    !sizeTokens.includes(t) &&
    !spacingTokens.includes(t) &&
    !motionTokens.includes(t) &&
    !screenTokens.includes(t)
  );

  if (colorTokens.length > 0) {
    console.log(`🎨 Color tokens (${colorTokens.length}):`);
    colorTokens.forEach(t => console.log(`   - ${t}`));
    console.log();
  }

  if (fontTokens.length > 0) {
    console.log(`📝 Typography tokens (${fontTokens.length}):`);
    fontTokens.forEach(t => console.log(`   - ${t}`));
    console.log();
  }

  if (sizeTokens.length > 0) {
    console.log(`📏 Size tokens (${sizeTokens.length}):`);
    sizeTokens.forEach(t => console.log(`   - ${t}`));
    console.log();
  }

  if (spacingTokens.length > 0) {
    console.log(`📐 Spacing tokens (${spacingTokens.length}):`);
    spacingTokens.forEach(t => console.log(`   - ${t}`));
    console.log();
  }

  if (motionTokens.length > 0) {
    console.log(`🎬 Motion tokens (${motionTokens.length}):`);
    motionTokens.forEach(t => console.log(`   - ${t}`));
    console.log();
  }

  if (screenTokens.length > 0) {
    console.log(`📱 Screen size tokens (${screenTokens.length}):`);
    screenTokens.forEach(t => console.log(`   - ${t}`));
    console.log();
  }

  if (otherTokens.length > 0) {
    console.log(`🔧 Other tokens (${otherTokens.length}):`);
    otherTokens.forEach(t => console.log(`   - ${t}`));
    console.log();
  }
} else {
  console.log('✅ All Ant Design alias tokens are defined!\n');
}

// Analyze component tokens
console.log('\n📦 Component-Specific Tokens:\n');
console.log('These are component-specific tokens that should be mapped in getAntDesignComponents():\n');

Object.entries(componentTokens).forEach(([component, tokens]) => {
  console.log(`${component}: ${tokens.length} specific tokens`);
  console.log(`   Example: ${tokens.slice(0, 3).join(', ')}`);
  console.log();
});

console.log('\n💡 Recommendations:\n');
console.log('1. Add missing color tokens to theme-adapter (map to CSS variables)');
console.log('2. Typography/spacing/motion tokens can use defaults (or add if needed)');
console.log('3. Screen size tokens are fine with defaults (responsive breakpoints)');
console.log('4. Focus on component-specific tokens in getAntDesignComponents()');
console.log('5. Test each component in both light and dark themes\n');

console.log('📖 Next Steps:\n');
console.log('1. Run: tsx scripts/analyze-theme-tokens.ts');
console.log('2. Review missing tokens and decide which need CSS variable mapping');
console.log('3. Update theme-adapter.ts with missing critical tokens');
console.log('4. Update getAntDesignComponents() for each component you use');
console.log('5. Test thoroughly in both themes\n');
