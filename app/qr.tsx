import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { useCatalog } from '@/state/CatalogContext';
import { Button } from '@/components/Button';

const isWeb = Platform.OS === 'web';

export default function QRScreen() {
  if (isWeb) return <WebQRFallback />;
  return <NativeQRScanner />;
}

function NativeQRScanner() {
  const router = useRouter();
  const { plants } = useCatalog();
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);
  const [scanned, setScanned] = useState(false);
  const lineY = useSharedValue(0);

  useEffect(() => {
    lineY.value = withRepeat(
      withTiming(220, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [lineY]);

  const lineStyle = useAnimatedStyle(() => ({ transform: [{ translateY: lineY.value }] }));

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleScan = (data: string) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const match = plants.find((p) => data.toLowerCase().includes(p.id)) ?? plants[0];
    if (!match) return;
    setTimeout(() => router.replace(`/plant/${match.id}`), 600);
  };

  const simulateScan = () => handleScan('verdor://plant/monstera');

  if (!permission) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
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
        <Ionicons name="qr-code-outline" size={64} color={colors.brand[500]} />
        <Text style={[typography.displayLg, { textAlign: 'center' }]}>Permitir cámara</Text>
        <Text style={[typography.bodyMd, { textAlign: 'center', color: colors.text.secondary }]}>
          La usamos para escanear los QR de las plantas de tu vivero.
        </Text>
        <Button label="Permitir" onPress={requestPermission} />
        <Pressable onPress={() => router.back()}>
          <Text style={[typography.bodySm, { color: colors.brand[700] }]}>Cancelar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={(e) => handleScan(e.data)}
      />

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
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.full,
            backgroundColor: 'rgba(0,0,0,0.55)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(0,0,0,0.55)',
            borderRadius: radius.full,
            padding: 4,
          }}
        >
          <Pressable
            onPress={() => router.replace('/camera')}
            style={{ paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.full }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Cámara</Text>
          </Pressable>
          <View
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: 8,
              borderRadius: radius.full,
              backgroundColor: colors.brand[500],
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>QR</Text>
          </View>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Viewfinder square + scan line */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 240,
          height: 240,
          marginLeft: -120,
          marginTop: -160,
          overflow: 'hidden',
        }}
      >
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Corner pos="bl" />
        <Corner pos="br" />
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 16,
              right: 16,
              height: 2,
              backgroundColor: colors.brand[500],
              shadowColor: colors.brand[500],
              shadowOpacity: 0.8,
              shadowRadius: 12,
            },
            lineStyle,
          ]}
        />
      </View>

      <Text
        style={{
          position: 'absolute',
          top: '50%',
          alignSelf: 'center',
          marginTop: 116,
          color: '#fff',
          fontWeight: '600',
          fontSize: 14,
          textShadowColor: 'rgba(0,0,0,0.8)',
          textShadowRadius: 6,
        }}
      >
        Escaneá el QR de tu planta
      </Text>

      {/* Demo button: simulate a scan */}
      <View style={{ position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center', gap: spacing.md }}>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Demo · sin QR físico:</Text>
        <Pressable
          onPress={simulateScan}
          style={({ pressed }) => ({
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            backgroundColor: colors.brand[500],
            borderRadius: radius.full,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Simular escaneo</Text>
        </Pressable>
      </View>

      {scanned && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: colors.semantic.success,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="checkmark" size={48} color="#fff" />
          </View>
        </View>
      )}
    </View>
  );
}

function WebQRFallback() {
  const router = useRouter();
  const { plants } = useCatalog();
  const goToPlant = (plantId: string) => router.replace(`/plant/${plantId}`);

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
            <Pressable
              onPress={() => router.replace('/camera')}
              style={{ paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.full }}
            >
              <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: 13 }}>Cámara</Text>
            </Pressable>
            <View
              style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: 8,
                borderRadius: radius.full,
                backgroundColor: colors.brand[500],
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>QR</Text>
            </View>
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
              Modo demo web · Para escanear QR reales abrí esta app en Expo Go o en el simulador iOS/Android.
            </Text>
          </View>

          <Text style={[typography.headingMd, { marginTop: spacing.md }]}>Simulá un escaneo</Text>
          <Text style={[typography.bodySm, { color: colors.text.secondary }]}>
            Tocá una planta para ver la ficha como si hubieras escaneado su QR.
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm }}>
            {plants.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => goToPlant(p.id)}
                style={({ pressed }) => ({
                  width: '47%',
                  flexGrow: 1,
                  backgroundColor: colors.surface.raised,
                  borderRadius: radius.md,
                  overflow: 'hidden',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: p.image }}
                    style={{ width: '100%', height: 140, backgroundColor: colors.brand[100] }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.55)',
                      borderRadius: radius.full,
                      padding: 6,
                    }}
                  >
                    <Ionicons name="qr-code" size={16} color="#fff" />
                  </View>
                </View>
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
        </View>
      </ScrollView>
    </View>
  );
}

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const size = 32;
  const stroke = 3;
  const color = colors.brand[500];
  const base: any = { position: 'absolute', width: size, height: size, borderColor: color };
  const styles: Record<typeof pos, any> = {
    tl: { ...base, top: 0, left: 0, borderTopWidth: stroke, borderLeftWidth: stroke },
    tr: { ...base, top: 0, right: 0, borderTopWidth: stroke, borderRightWidth: stroke },
    bl: { ...base, bottom: 0, left: 0, borderBottomWidth: stroke, borderLeftWidth: stroke },
    br: { ...base, bottom: 0, right: 0, borderBottomWidth: stroke, borderRightWidth: stroke },
  };
  return <View style={styles[pos]} />;
}
