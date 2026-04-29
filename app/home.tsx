import { ScrollView, View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TabBar } from '@/components/TabBar';
import { PlantCard } from '@/components/PlantCard';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { plants, articles } from '@/data/plants';
import { useApp } from '@/state/AppContext';
import { useUser } from '@/state/UserContext';
import { activeReminders, describeWaterStatus } from '@/lib/reminders';

export default function Home() {
  const router = useRouter();
  const user = useUser();
  const { savedIds, waterLog, markWatered, history } = useApp();
  const savedPlants = plants.filter((p) => savedIds.includes(p.id));
  const reminders = activeReminders(savedPlants, waterLog);
  const recentIdentifications = history.slice(0, 6);

  const onMarkWatered = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    markWatered(id);
  };

  return (
    <ScreenContainer withTabBarPadding>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing['2xl'] }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.full,
                backgroundColor: colors.brand[100],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.brand[700] }}>
                {user.initial}
              </Text>
            </View>
            <View>
              <Text style={typography.bodyMd}>Hola, {user.name} 👋</Text>
              <Text style={typography.caption}>Hoy en {user.city}, {user.weather}</Text>
            </View>
          </View>
          <Pressable hitSlop={12}>
            <Ionicons name="notifications-outline" size={24} color={colors.text.secondary} />
          </Pressable>
        </View>

        {/* Hero — two distinct actions */}
        <View
          style={[
            {
              marginHorizontal: spacing.xl,
              borderRadius: radius.lg,
              overflow: 'hidden',
              backgroundColor: colors.brand[700],
              padding: spacing.lg,
              gap: spacing.md,
            },
            shadows.raised,
          ]}
        >
          <Text style={[typography.headingSm, { color: colors.text.inverse }]}>
            Identificá tu planta
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <HeroAction
              icon="camera"
              label="Tomar foto"
              hint="Identificación con IA"
              onPress={() => router.push('/camera')}
            />
            <HeroAction
              icon="qr-code"
              label="Escanear QR"
              hint="Plantas Zamorano"
              onPress={() => router.push('/qr')}
            />
          </View>
        </View>

        {/* Recent identifications */}
        {recentIdentifications.length > 0 && (
          <>
            <SectionHeader
              title="Identificaciones recientes"
              actionLabel="Ver todas"
              onAction={() => router.push('/history')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.md }}
            >
              {recentIdentifications.map((entry) => (
                <Pressable
                  key={entry.id}
                  onPress={() =>
                    entry.matchedPlantId
                      ? router.push(`/plant/${entry.matchedPlantId}`)
                      : router.push('/history')
                  }
                  style={({ pressed }) => [
                    {
                      width: 140,
                      borderRadius: radius.md,
                      backgroundColor: colors.surface.raised,
                      overflow: 'hidden',
                      opacity: pressed ? 0.9 : 1,
                    },
                    shadows.card,
                  ]}
                >
                  <Image
                    source={{ uri: entry.imageUri }}
                    style={{ width: '100%', height: 100, backgroundColor: colors.brand[100] }}
                  />
                  <View style={{ padding: spacing.md, gap: 2 }}>
                    <Text style={[typography.bodySm, { fontWeight: '700' }]} numberOfLines={1}>
                      {entry.commonName}
                    </Text>
                    <Text style={[typography.caption, { color: colors.text.tertiary }]} numberOfLines={1}>
                      {relativeTime(entry.timestamp)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* My garden */}
        <SectionHeader title="Mi jardín" actionLabel="Ver todo" onAction={() => router.push('/garden')} />
        {savedPlants.length === 0 ? (
          <EmptyHint text="Aún no tenés plantas guardadas" />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.md }}
          >
            {savedPlants.map((p) => (
              <PlantCard key={p.id} plant={p} />
            ))}
          </ScrollView>
        )}

        {/* Reminders */}
        <SectionHeader title="Hoy te toca" />
        <View style={{ paddingHorizontal: spacing.xl, gap: spacing.md }}>
          {reminders.length === 0 ? (
            <View
              style={[
                {
                  backgroundColor: colors.brand[50],
                  borderRadius: radius.md,
                  padding: spacing.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                },
              ]}
            >
              <Text style={{ fontSize: 24 }}>🌱</Text>
              <View style={{ flex: 1 }}>
                <Text style={typography.headingSm}>Todo al día</Text>
                <Text style={typography.bodySm}>Tus plantas no necesitan riego ahora.</Text>
              </View>
            </View>
          ) : (
            reminders.map((r) => {
              const urgent = r.overdueDays >= 2;
              return (
                <View
                  key={r.plant.id}
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      backgroundColor: colors.surface.raised,
                      borderRadius: radius.md,
                      padding: spacing.lg,
                      borderLeftWidth: urgent ? 4 : 0,
                      borderLeftColor: urgent ? colors.semantic.error : 'transparent',
                    },
                    shadows.card,
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>💧</Text>
                  <Pressable
                    onPress={() => router.push(`/plant/${r.plant.id}`)}
                    style={{ flex: 1 }}
                    hitSlop={6}
                  >
                    <Text style={typography.headingSm} numberOfLines={1}>
                      Regar {r.plant.commonName}
                    </Text>
                    <Text
                      style={[
                        typography.bodySm,
                        urgent && { color: colors.semantic.error, fontWeight: '600' },
                      ]}
                    >
                      {describeWaterStatus(r)}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onMarkWatered(r.plant.id)}
                    hitSlop={8}
                    style={({ pressed }) => ({
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: radius.full,
                      backgroundColor: colors.brand[700],
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Ionicons name="checkmark" size={14} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Listo</Text>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>

        {/* Articles from Club */}
        <SectionHeader title="Del Club Zamorano" actionLabel="Más" onAction={() => router.push('/club')} />
        <View style={{ paddingHorizontal: spacing.xl, gap: spacing.md }}>
          {articles.map((a) => (
            <View
              key={a.id}
              style={[
                {
                  backgroundColor: colors.surface.raised,
                  borderRadius: radius.md,
                  overflow: 'hidden',
                },
                shadows.card,
              ]}
            >
              <Image source={{ uri: a.image }} style={{ width: '100%', height: 140 }} />
              <View style={{ padding: spacing.lg, gap: 6 }}>
                <Text style={typography.headingSm}>{a.title}</Text>
                <Text style={typography.bodySm} numberOfLines={2}>
                  {a.excerpt}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <TabBar />
    </ScreenContainer>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        marginTop: spacing['2xl'],
        marginBottom: spacing.md,
      }}
    >
      <Text style={typography.headingMd}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={[typography.bodySm, { color: colors.brand[700], fontWeight: '600' }]}>
            {actionLabel} →
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <View style={{ paddingHorizontal: spacing.xl }}>
      <Text style={[typography.bodySm, { color: colors.text.tertiary, fontStyle: 'italic' }]}>{text}</Text>
    </View>
  );
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Hace un momento';
  if (min < 60) return `Hace ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `Hace ${hr} h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `Hace ${day} día${day === 1 ? '' : 's'}`;
  return new Date(iso).toLocaleDateString('es-CR', { day: 'numeric', month: 'short' });
}

function HeroAction({
  icon,
  label,
  hint,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderRadius: radius.md,
        padding: spacing.md,
        gap: 6,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.full,
          backgroundColor: 'rgba(255,255,255,0.22)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={22} color={colors.text.inverse} />
      </View>
      <Text style={[typography.bodyMd, { color: colors.text.inverse, fontWeight: '700' }]}>
        {label}
      </Text>
      <Text style={[typography.caption, { color: 'rgba(255,255,255,0.75)' }]}>{hint}</Text>
    </Pressable>
  );
}
