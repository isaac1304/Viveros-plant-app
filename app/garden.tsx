import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TabBar } from '@/components/TabBar';
import { PlantCard } from '@/components/PlantCard';
import { Button } from '@/components/Button';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { plants, type Plant } from '@/data/plants';
import { useApp } from '@/state/AppContext';

type FilterKey = 'todas' | 'riego' | 'atencion';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'riego', label: 'Riego frecuente' },
  { key: 'atencion', label: 'Necesitan atención' },
];

const needsFrequentWater = (p: Plant) =>
  /diario|frecuente|3x|4x/i.test(p.water);

const needsAttention = (p: Plant) =>
  p.pests.some((i) => i.severity === 'danger') ||
  p.diseases.some((i) => i.severity === 'danger');

export default function Garden() {
  const router = useRouter();
  const { savedIds } = useApp();
  const [filter, setFilter] = useState<FilterKey>('todas');
  const [query, setQuery] = useState('');

  const saved = plants.filter((p) => savedIds.includes(p.id));

  const filtered = useMemo(() => {
    let result = saved;
    if (filter === 'riego') result = result.filter(needsFrequentWater);
    else if (filter === 'atencion') result = result.filter(needsAttention);
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.commonName.toLowerCase().includes(q) ||
          p.scientificName.toLowerCase().includes(q),
      );
    }
    return result;
  }, [saved, filter, query]);

  return (
    <ScreenContainer withTabBarPadding>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing['2xl'] }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
          <Text style={typography.displayLg}>Mi jardín</Text>
          <Text style={[typography.bodySm, { marginTop: 4 }]}>
            {saved.length} {saved.length === 1 ? 'planta guardada' : 'plantas guardadas'}
          </Text>
        </View>

        {saved.length > 0 && (
          <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.lg }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                backgroundColor: colors.surface.raised,
                borderRadius: radius.md,
                paddingHorizontal: spacing.md,
                borderWidth: 1,
                borderColor: colors.border.subtle,
              }}
            >
              <Ionicons name="search" size={18} color={colors.text.tertiary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar planta…"
                placeholderTextColor={colors.text.tertiary}
                style={[
                  {
                    flex: 1,
                    paddingVertical: spacing.md,
                    fontSize: 14,
                    color: colors.text.primary,
                  },
                  Platform.OS === 'web' && ({ outlineStyle: 'none' } as object),
                ]}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} hitSlop={10}>
                  <Ionicons name="close-circle" size={18} color={colors.text.tertiary} />
                </Pressable>
              )}
            </View>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.sm, paddingVertical: spacing.lg }}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const count =
              f.key === 'todas'
                ? saved.length
                : f.key === 'riego'
                  ? saved.filter(needsFrequentWater).length
                  : saved.filter(needsAttention).length;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={{
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.full,
                  backgroundColor: active ? colors.brand[700] : colors.surface.raised,
                  borderWidth: 1,
                  borderColor: active ? colors.brand[700] : colors.border.subtle,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: active ? colors.text.inverse : colors.text.secondary,
                  }}
                >
                  {f.label}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    borderRadius: radius.full,
                    backgroundColor: active ? 'rgba(255,255,255,0.22)' : colors.brand[100],
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: active ? colors.text.inverse : colors.brand[700],
                    }}
                  >
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {saved.length === 0 ? (
          <View style={{ alignItems: 'center', padding: spacing['3xl'], gap: spacing.lg }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: colors.brand[100],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="leaf-outline" size={48} color={colors.brand[500]} />
            </View>
            <Text style={[typography.headingMd, { textAlign: 'center' }]}>Tu jardín está vacío</Text>
            <Text style={[typography.bodySm, { textAlign: 'center', maxWidth: 260 }]}>
              Identificá tu primera planta para empezar a llevar control de cuidados y recordatorios.
            </Text>
            <Button label="Identificar planta" onPress={() => router.push('/camera')} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing['2xl'], paddingHorizontal: spacing.xl, gap: spacing.md }}>
            <Ionicons
              name={query ? 'search-outline' : 'filter-outline'}
              size={32}
              color={colors.text.tertiary}
            />
            <Text style={[typography.bodyMd, { textAlign: 'center', color: colors.text.secondary }]}>
              {query
                ? `No encontramos plantas con "${query}".`
                : filter === 'riego'
                  ? 'Ninguna de tus plantas necesita riego frecuente.'
                  : 'Ninguna de tus plantas tiene problemas reportados.'}
            </Text>
            <Pressable
              onPress={() => {
                setFilter('todas');
                setQuery('');
              }}
              hitSlop={8}
            >
              <Text style={[typography.bodySm, { color: colors.brand[700], fontWeight: '600' }]}>
                Ver todas →
              </Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing.md,
              paddingHorizontal: spacing.xl,
            }}
          >
            {filtered.map((p) => (
              <View key={p.id} style={{ flexBasis: '47%', flexGrow: 1 }}>
                <PlantCard plant={p} variant="full" />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TabBar />
    </ScreenContainer>
  );
}
