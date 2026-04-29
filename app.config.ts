import type { ExpoConfig, ConfigContext } from 'expo/config';

const APP_VARIANT = (process.env.APP_VARIANT ?? 'development') as 'development' | 'production';
const IS_DEV = APP_VARIANT === 'development';

const BUNDLE_ID = IS_DEV ? 'app.verdor.customer.dev' : 'app.verdor.customer';
const APP_NAME = IS_DEV ? 'Verdor (Dev)' : 'Verdor';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_NAME,
  slug: 'verdor-app',
  ios: {
    ...config.ios,
    bundleIdentifier: BUNDLE_ID,
  },
  android: {
    ...config.android,
    package: BUNDLE_ID,
  },
  extra: {
    ...config.extra,
    appVariant: APP_VARIANT,
  },
});
