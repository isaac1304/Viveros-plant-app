import { Platform, type TextStyle } from 'react-native';
import { colors } from './tokens';

// Editorial system per handoff: Fraunces (display) + system body.
// On native we'd load Fraunces via expo-font; on web Platform-stack falls through.
const DISPLAY_FONT = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  web: 'Fraunces, "Source Serif 4", Georgia, serif',
}) as string;

const BODY_FONT = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
}) as string;

export const fonts = {
  display: DISPLAY_FONT,
  body: BODY_FONT,
};

export const typography = {
  // Display family — for headers, titles, hero text
  displayXl: {
    fontFamily: DISPLAY_FONT,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: colors.text.primary,
  } satisfies TextStyle,
  displayLg: {
    fontFamily: DISPLAY_FONT,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: colors.text.primary,
  } satisfies TextStyle,
  displayMd: {
    fontFamily: DISPLAY_FONT,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: colors.text.primary,
  } satisfies TextStyle,
  // Headings
  headingMd: {
    fontFamily: DISPLAY_FONT,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.1,
    color: colors.text.primary,
  } satisfies TextStyle,
  headingSm: {
    fontFamily: DISPLAY_FONT,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.text.primary,
  } satisfies TextStyle,
  // Body
  bodyLg: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: colors.text.primary,
  } satisfies TextStyle,
  bodyMd: {
    fontFamily: BODY_FONT,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
    color: colors.text.primary,
  } satisfies TextStyle,
  bodySm: {
    fontFamily: BODY_FONT,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
    color: colors.text.secondary,
  } satisfies TextStyle,
  caption: {
    fontFamily: BODY_FONT,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: colors.text.tertiary,
  } satisfies TextStyle,
  // Pills/labels — uppercase 10-11px peso 700, letter-spacing 1.4
  kicker: {
    fontFamily: BODY_FONT,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.brand[700],
  } satisfies TextStyle,
  button: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  } satisfies TextStyle,
};
