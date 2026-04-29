import { useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, type NativeSyntheticEvent, type NativeScrollEvent, useWindowDimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { ensureNotificationPermission } from '@/lib/notifications';

type Slide = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  iconBg: string;
  kind: 'info' | 'permission';
};

const SLIDES: Slide[] = [
  {
    kind: 'info',
    icon: 'leaf',
    title: 'Identificá cualquier planta',
    body: 'Tomá una foto y nuestra IA te dice qué planta es, sus cuidados y plagas más comunes.',
    iconBg: colors.brand[500],
  },
  {
    kind: 'info',
    icon: 'qr-code',
    title: 'Escaneá el QR de tus plantas Zamorano',
    body: 'Cada planta que comprás trae su ficha digital — toda la información del experto en tu bolsillo.',
    iconBg: colors.accent.terracotta,
  },
  {
    kind: 'info',
    icon: 'water',
    title: 'Cuidados y recordatorios',
    body: 'Te avisamos cuándo regar, fertilizar y revisar plagas. Tus plantas viven más, vos te preocupás menos.',
    iconBg: colors.accent.sun,
  },
  {
    kind: 'permission',
    icon: 'notifications',
    title: 'Cámara y recordatorios',
    body: 'Necesitamos tu cámara para identificar plantas y queremos avisarte cuándo regar. Vos decidís cuándo se usa cada una.',
    iconBg: colors.brand[700],
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const [requesting, setRequesting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [, requestPermission] = useCameraPermissions();

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== page) setPage(next);
  };

  const current = SLIDES[page];
  const isLast = page === SLIDES.length - 1;
  const isPermissionSlide = current?.kind === 'permission';

  const goHome = () => router.replace('/home');

  const handleNext = () => {
    if (!isLast) {
      scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true });
      setPage(page + 1);
      return;
    }
    if (isPermissionSlide && Platform.OS !== 'web') {
      setRequesting(true);
      Promise.all([requestPermission().catch(() => {}), ensureNotificationPermission().catch(() => false)])
        .finally(() => {
          setRequesting(false);
          goHome();
        });
      return;
    }
    goHome();
  };

  const primaryLabel = !isLast
    ? 'Siguiente'
    : isPermissionSlide
      ? requesting
        ? 'Solicitando…'
        : 'Permitir acceso'
      : 'Comenzar';

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: spacing.lg }}>
        <Pressable onPress={() => router.replace('/home')} hitSlop={12}>
          <Text style={[typography.bodyMd, { color: colors.brand[700], fontWeight: '600' }]}>
            Saltar
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {SLIDES.map((s, i) => (
          <View
            key={i}
            style={{
              width,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: spacing['2xl'],
            }}
          >
            <View
              style={{
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: s.iconBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing['2xl'],
              }}
            >
              <Ionicons name={s.icon} size={88} color={colors.text.inverse} />
            </View>
            <Text style={[typography.displayLg, { textAlign: 'center', color: colors.brand[900] }]}>
              {s.title}
            </Text>
            <Text
              style={[
                typography.bodyMd,
                { textAlign: 'center', color: colors.text.secondary, marginTop: spacing.md },
              ]}
            >
              {s.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ padding: spacing.xl, gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === page ? 24 : 8,
                height: 8,
                borderRadius: radius.full,
                backgroundColor: i === page ? colors.brand[500] : colors.border.strong,
              }}
            />
          ))}
        </View>

        <Button
          label={primaryLabel}
          onPress={handleNext}
          fullWidth
          size="lg"
          loading={requesting}
        />
        {isPermissionSlide && !requesting && (
          <Pressable onPress={goHome} hitSlop={10} style={{ alignItems: 'center' }}>
            <Text style={[typography.bodySm, { color: colors.text.secondary, fontWeight: '600' }]}>
              Más tarde
            </Text>
          </Pressable>
        )}
      </View>
    </ScreenContainer>
  );
}
