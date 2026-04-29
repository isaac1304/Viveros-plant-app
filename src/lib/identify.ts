import Constants from 'expo-constants';

export type Severity = 'info' | 'warning' | 'danger';

export type Issue = {
  name: string;
  symptoms: string;
  treatment: string;
  severity: Severity;
};

export type IdentifyDetails = {
  description: string;
  origin: string;
  light: string;
  water: string;
  temp: string;
  toxic: boolean;
  tips: string[];
  pests: Issue[];
  diseases: Issue[];
};

export type IdentifyResult = {
  matchedPlantId: string | null;
  commonName: string;
  scientificName: string;
  confidence: number;
  alternatives: { commonName: string; scientificName: string }[];
  details?: IdentifyDetails;
};

function getApiUrl(): string {
  // Prefer an explicit override (set in app.json -> extra.apiBaseUrl, or via .env).
  const override = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;
  if (override) return `${override.replace(/\/$/, '')}/api/identify`;

  // In dev: talk to the Expo dev server on the same origin as the bundle.
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.hostUri;
  if (hostUri) {
    // hostUri looks like "192.168.0.10:8081" or "10.0.0.5:8081"
    return `http://${hostUri}/api/identify`;
  }

  // Fallback (web build / production): same-origin
  return '/api/identify';
}

export async function identifyPlant(imageBase64: string): Promise<IdentifyResult> {
  const res = await fetch(getApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Identify failed (${res.status}): ${text.slice(0, 120)}`);
  }
  return (await res.json()) as IdentifyResult;
}
