import { ScrollView, View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TabBar } from '@/components/TabBar';
import { PlantCard } from '@/components/PlantCard';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { plants, reminders, articles, getPlantById } from '@/data/plants';
import { useApp } from '@/state/AppContext';

export default function Home() {
  const router = useRouter();
  const { savedIds } = useApp();
  const savedPlants = plants.filter((p) => savedIds.includes(p.id));

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
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.brand[700] }}>M</Text>
            </View>
            <View>
              <Text style={typography.bodyMd}>Hola, María 👋</Text>
              <Text style={typography.caption}>Hoy en Cartago, 22°C parcial</Text>
            </View>
          </View>
          <Pressable hitSlop={12}>
            <Ionicons name="notifications-outline" size={24} color={colors.text.secondary} />
          </Pressable>
        </View>

        {/* Hero CTA */}
        <Pressable
          onPress={() => router.push('/camera')}
          style={({ pressed }) => [
            {
              marginHorizontal: spacing.xl,
              borderRadius: radius.lg,
              overflow: 'hidden',
              opacity: pressed ? 0.95 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            },
            shadows.raised,
          ]}
        >
          <View
            style={{
              padding: spacing.xl,
              backgroundColor: colors.brand[700],
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.lg,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: radius.full,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="camera" size={28} color={colors.text.inverse} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.headingMd, { color: colors.text.inverse }]}>
                Identificar planta
              </Text>
              <Text style={[typography.bodySm, { color: 'rgba(255,255,255,0.85)' }]}>
                Tomá una foto o escaneá un QR
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/qr')}
              hitSlop={12}
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.md,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="qr-code" size={22} color={colors.text.inverse} />
            </Pressable>
          </View>
        </Pressable>

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
          {reminders.map((r) => {
            const p = getPlantById(r.plantId);
            return (
              <Pressable
                key={r.id}
                onPress={() => p && router.push(`/plant/${p.id}`)}
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    backgroundColor: colors.surface.raised,
                    borderRadius: radius.md,
                    padding: spacing.lg,
                    opacity: pressed ? 0.9 : 1,
                    borderLeftWidth: r.urgent ? 4 : 0,
                    borderLeftColor: r.urgent ? colors.semantic.error : 'transparent',
                  },
                  shadows.card,
                ]}
              >
                <Text style={{ fontSize: 24 }}>{r.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={typography.headingSm}>{r.task}</Text>
                  <Text style={typography.bodySm}>{r.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </Pressable>
            );
          })}
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
