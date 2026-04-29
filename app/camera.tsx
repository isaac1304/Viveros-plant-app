import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Platform, Image, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';
import { identifyPlant } from '@/lib/identify';
import { plants } from '@/data/plants';
import { useUser } from '@/state/UserContext';

const isWeb = Platform.OS === 'web';

// Built per-render so it picks up the caller's tenant. Components below call
// this with their useUser() result; we keep it as a plain function (not a hook)
// so it works in event handlers.
async function openTenantWhatsApp(
  tenantWhatsapp: string | undefined,
  tenantShortName: string,
): Promise<void> {
  if (!tenantWhatsapp) return; // tenant has no number configured — caller should disable the button
  const msg = encodeURIComponent(
    `Hola ${tenantShortName}, no pude identificar mi planta con la app. ¿Me ayudan?`,
  );
  const url = `https://wa.me/${tenantWhatsapp}?text=${msg}`;
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) throw new Error('cant-open');
    await Linking.openURL(url);
  } catch {
    if (isWeb && typeof window !== 'undefined') window.open(url, '_blank');
  }
}

export default function CameraScreen() {
  if (isWeb) return <WebCameraFallback />;
  return <NativeCamera />;
}

function NativeCamera() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const onShutter = async () => {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    setError(null);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        base64: true,
        skipProcessing: true,
      });
      if (!photo?.base64) throw new Error('No image data');
      const result = await identifyPlant(photo.base64);
      router.replace({
        pathname: '/result',
        params: {
          matchedPlantId: result.matchedPlantId ?? '',
          commonName: result.commonName,
          scientificName: result.scientificName,
          confidence: String(result.confidence),
          imageUri: photo.uri,
          alternatives: JSON.stringify(result.alternatives ?? []),
          details: result.details ? JSON.stringify(result.details) : '',
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Algo falló';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  if (!permission) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.surface.base,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
          gap: spacing.lg,
        }}
      >
        <Ionicons name="camera-outline" size={64} color={colors.brand[500]} />
        <Text style={[typography.displayLg, { textAlign: 'center' }]}>Necesitamos tu cámara</Text>
        <Text style={[typography.bodyMd, { textAlign: 'center', color: colors.text.secondary }]}>
          Para identificar plantas con tu foto. Sólo se usa cuando vos lo decidís.
        </Text>
        <Button label="Permitir cámara" onPress={requestPermission} />
        <Pressable onPress={() => router.back()}>
          <Text style={[typography.bodySm, { color: colors.brand[700] }]}>Cancelar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

      {error && (
        <IdentifyErrorSheet
          message={error}
          onRetry={() => {
            setError(null);
            onShutter();
          }}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Top bar */}
      <View
        style={{
          position: 'absolute',
          top: 60,
          left: 0,
          right: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.xl,
        }}
      >
        <RoundIconButton icon="close" onPress={() => router.back()} />
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(0,0,0,0.55)',
            borderRadius: radius.full,
            padding: 4,
          }}
        >
          <ToggleChip label="Cámara" active onPress={() => {}} />
          <ToggleChip label="QR" active={false} onPress={() => router.replace('/qr')} />
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Viewfinder corners */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 280,
          height: 280,
          marginLeft: -140,
          marginTop: -160,
        }}
      >
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Corner pos="bl" />
        <Corner pos="br" />
      </View>

      <Text
        style={{
          position: 'absolute',
          top: '50%',
          alignSelf: 'center',
          marginTop: 156,
          color: '#fff',
          fontWeight: '600',
          fontSize: 14,
          textShadowColor: 'rgba(0,0,0,0.8)',
          textShadowRadius: 6,
        }}
      >
        Apuntá a la hoja o flor
      </Text>

      {/* Bottom */}
      <View
        style={{
          position: 'absolute',
          bottom: 50,
          left: 0,
          right: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Pressable
          onPress={onShutter}
          disabled={busy}
          style={({ pressed }) => ({
            width: 78,
            height: 78,
            borderRadius: 39,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 4,
            borderColor: colors.brand[500],
            opacity: pressed || busy ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}
        >
          {busy ? (
            <ActivityIndicator color={colors.brand[700]} />
          ) : (
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.brand[500],
              }}
            />
          )}
        </Pressable>
      </View>

      {busy && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
          }}
        >
          <ActivityIndicator color="#fff" size="large" />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Identificando…</Text>
        </Animated.View>
      )}
    </View>
  );
}

function WebCameraFallback() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);

  const goToDemoResult = (plantId: string) => {
    const plant = plants.find((p) => p.id === plantId);
    if (!plant) return;
    router.replace({
      pathname: '/result',
      params: {
        matchedPlantId: plant.id,
        commonName: plant.commonName,
        scientificName: plant.scientificName,
        confidence: String(94),
        imageUri: plant.image,
        alternatives: JSON.stringify([]),
      },
    });
  };

  const onUploadFile = async (file: File) => {
    setBusy(true);
    setError(null);
    setLastFile(file);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1] ?? '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const previewUri = URL.createObjectURL(file);
      const result = await identifyPlant(base64);
      router.replace({
        pathname: '/result',
        params: {
          matchedPlantId: result.matchedPlantId ?? '',
          commonName: result.commonName,
          scientificName: result.scientificName,
          confidence: String(result.confidence),
          imageUri: previewUri,
          alternatives: JSON.stringify(result.alternatives ?? []),
          details: result.details ? JSON.stringify(result.details) : '',
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Algo falló';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface.base }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
        <View
          style={{
            paddingTop: spacing['2xl'],
            paddingHorizontal: spacing.xl,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.full,
              backgroundColor: colors.surface.raised,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="close" size={22} color={colors.text.primary} />
          </Pressable>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.surface.raised,
              borderRadius: radius.full,
              padding: 4,
            }}
          >
            <View
              style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: 8,
                borderRadius: radius.full,
                backgroundColor: colors.brand[500],
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Cámara</Text>
            </View>
            <Pressable
              onPress={() => router.replace('/qr')}
              style={{ paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.full }}
            >
              <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: 13 }}>QR</Text>
            </Pressable>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <View style={{ padding: spacing.xl, gap: spacing.md }}>
          <View
            style={{
              backgroundColor: colors.brand[100],
              borderRadius: radius.md,
              padding: spacing.md,
              flexDirection: 'row',
              gap: spacing.sm,
            }}
          >
            <Ionicons name="information-circle" size={20} color={colors.brand[700]} />
            <Text style={[typography.bodySm, { flex: 1, color: colors.brand[900] }]}>
              Modo demo web · Para usar la cámara real abrí esta app en Expo Go o en el simulador iOS/Android.
            </Text>
          </View>

          {error && (
            <InlineErrorCard
              message={error}
              onRetry={lastFile ? () => onUploadFile(lastFile) : undefined}
              onDismiss={() => setError(null)}
            />
          )}

          <Text style={[typography.headingMd, { marginTop: spacing.md }]}>Identificá una planta demo</Text>
          <Text style={[typography.bodySm, { color: colors.text.secondary }]}>
            Tocá una para simular el escaneo y ver la ficha completa.
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm }}>
            {plants.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => goToDemoResult(p.id)}
                style={({ pressed }) => ({
                  width: '47%',
                  flexGrow: 1,
                  backgroundColor: colors.surface.raised,
                  borderRadius: radius.md,
                  overflow: 'hidden',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Image
                  source={{ uri: p.image }}
                  style={{ width: '100%', height: 140, backgroundColor: colors.brand[100] }}
                />
                <View style={{ padding: spacing.md, gap: 4 }}>
                  <Text style={[typography.bodyMd, { fontWeight: '700' }]} numberOfLines={1}>
                    {p.commonName}
                  </Text>
                  <Text
                    style={[typography.caption, { fontStyle: 'italic', color: colors.text.secondary }]}
                    numberOfLines={1}
                  >
                    {p.scientificName}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
            <Text style={typography.headingMd}>O subí una foto real</Text>
            <Text style={[typography.bodySm, { color: colors.text.secondary }]}>
              Usá una foto de tu galería. Requiere ANTHROPIC_API_KEY configurada.
            </Text>
            <WebFileUploadButton busy={busy} onPick={onUploadFile} />
          </View>
        </View>
      </ScrollView>

      {busy && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
          }}
        >
          <ActivityIndicator color="#fff" size="large" />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Identificando…</Text>
        </View>
      )}
    </View>
  );
}

function WebFileUploadButton({ busy, onPick }: { busy: boolean; onPick: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <View>
      <input
        ref={(el: HTMLInputElement | null) => {
          inputRef.current = el;
        }}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e: any) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          if (inputRef.current) inputRef.current.value = '';
        }}
      />
      <Button
        label={busy ? 'Identificando…' : 'Subir foto desde tu dispositivo'}
        onPress={() => inputRef.current?.click()}
        variant="secondary"
        fullWidth
      />
    </View>
  );
}

function ToggleChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: spacing.lg,
        paddingVertical: 8,
        borderRadius: radius.full,
        backgroundColor: active ? colors.brand[500] : 'transparent',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

function RoundIconButton({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 44,
        height: 44,
        borderRadius: radius.full,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={22} color="#fff" />
    </Pressable>
  );
}

function IdentifyErrorSheet({
  message,
  onRetry,
  onDismiss,
}: {
  message: string;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const { tenant } = useUser();
  const looksLikeApiKey = /api[_ ]?key|anthropic|unauthorized|401/i.test(message);
  const hasWhatsapp = Boolean(tenant.whatsapp);
  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'flex-end',
      }}
    >
      <Pressable style={{ flex: 1 }} onPress={onDismiss} />
      <View
        style={[
          {
            backgroundColor: colors.surface.raised,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            padding: spacing.xl,
            paddingBottom: spacing['2xl'],
            gap: spacing.md,
          },
          shadows.fab,
        ]}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#FFE8E8',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="alert-circle" size={28} color={colors.semantic.error} />
        </View>
        <Text style={typography.headingMd}>No pudimos identificarla</Text>
        <Text style={typography.bodySm}>
          {looksLikeApiKey
            ? `Falta configurar la clave de IA. Mientras tanto, podés consultar al equipo de ${tenant.shortName}.`
            : 'A veces ayuda mejorar la foto: que se vea bien la hoja o flor, sin sombras y a buena distancia.'}
        </Text>
        <Text style={[typography.caption, { color: colors.text.tertiary }]} numberOfLines={2}>
          Detalle técnico: {message}
        </Text>

        <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          <Button
            label="Reintentar"
            onPress={onRetry}
            iconLeft={<Ionicons name="refresh" size={18} color="#fff" />}
            fullWidth
          />
          {hasWhatsapp && (
            <Button
              label={`Consultar a ${tenant.shortName} por WhatsApp`}
              onPress={() => openTenantWhatsApp(tenant.whatsapp, tenant.shortName)}
              variant="secondary"
              iconLeft={<Ionicons name="logo-whatsapp" size={18} color={colors.brand[700]} />}
              fullWidth
            />
          )}
          <Pressable
            onPress={onDismiss}
            style={{ alignItems: 'center', paddingVertical: spacing.md }}
            hitSlop={8}
          >
            <Text style={[typography.bodySm, { color: colors.text.secondary, fontWeight: '600' }]}>
              Cerrar
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

function InlineErrorCard({
  message,
  onRetry,
  onDismiss,
}: {
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
}) {
  const { tenant } = useUser();
  const looksLikeApiKey = /api[_ ]?key|anthropic|unauthorized|401/i.test(message);
  const hasWhatsapp = Boolean(tenant.whatsapp);
  return (
    <View
      style={{
        backgroundColor: '#FFF1F1',
        borderRadius: radius.md,
        padding: spacing.md,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: '#F5C7C7',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Ionicons name="alert-circle" size={20} color={colors.semantic.error} />
        <Text style={[typography.bodySm, { color: colors.semantic.error, flex: 1, fontWeight: '600' }]}>
          No pudimos identificarla
        </Text>
        <Pressable onPress={onDismiss} hitSlop={10}>
          <Ionicons name="close" size={18} color={colors.semantic.error} />
        </Pressable>
      </View>
      <Text style={[typography.bodySm, { color: colors.text.secondary }]}>
        {looksLikeApiKey
          ? `Falta configurar la clave de IA. Probá consultar al equipo de ${tenant.shortName}.`
          : 'Probá una foto más clara de la hoja o flor. Si sigue fallando, consultá al equipo.'}
      </Text>
      <Text style={[typography.caption, { color: colors.text.tertiary }]} numberOfLines={2}>
        {message}
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 4 }}>
        {onRetry && (
          <Pressable
            onPress={onRetry}
            style={{
              flex: 1,
              paddingVertical: spacing.sm,
              borderRadius: radius.sm,
              backgroundColor: colors.brand[700],
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Reintentar</Text>
          </Pressable>
        )}
        {hasWhatsapp && (
        <Pressable
          onPress={() => openTenantWhatsApp(tenant.whatsapp, tenant.shortName)}
          style={{
            flex: 1,
            paddingVertical: spacing.sm,
            borderRadius: radius.sm,
            backgroundColor: colors.surface.raised,
            borderWidth: 1,
            borderColor: colors.border.subtle,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Ionicons name="logo-whatsapp" size={14} color={colors.brand[700]} />
          <Text style={{ color: colors.brand[700], fontWeight: '700', fontSize: 13 }}>
            Consultar
          </Text>
        </Pressable>
        )}
      </View>
    </View>
  );
}

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const size = 28;
  const stroke = 3;
  const color = colors.brand[500];
  const base: any = { position: 'absolute', width: size, height: size, borderColor: color };
  const styles: Record<typeof pos, any> = {
    tl: { ...base, top: 0, left: 0, borderTopWidth: stroke, borderLeftWidth: stroke, borderTopLeftRadius: 6 },
    tr: { ...base, top: 0, right: 0, borderTopWidth: stroke, borderRightWidth: stroke, borderTopRightRadius: 6 },
    bl: { ...base, bottom: 0, left: 0, borderBottomWidth: stroke, borderLeftWidth: stroke, borderBottomLeftRadius: 6 },
    br: { ...base, bottom: 0, right: 0, borderBottomWidth: stroke, borderRightWidth: stroke, borderBottomRightRadius: 6 },
  };
  return <View style={styles[pos]} />;
}
