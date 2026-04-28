import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TabBar } from '@/components/TabBar';
import { PlantCard } from '@/components/PlantCard';
import { Button } from '@/components/Button';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { plants } from '@/data/plants';
import { useApp } from '@/state/AppContext';

const FILTERS = ['Todas', 'Necesitan agua', 'Con problemas'] as const;

export default function Garden() {
  const router = useRouter();
  const { savedIds } = useApp();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Todas');

  const saved = plants.filter((p) => savedIds.includes(p.id));

  return (
    <ScreenContainer withTabBarPadding>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing['2xl'] }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
          <Text style={typography.displayLg}>Mi jardín</Text>
          <Text style={[typography.bodySm, { marginTop: 4 }]}>
            {saved.length} {saved.length === 1 ? 'planta guardada' : 'plantas guardadas'}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.sm, paddingVertical: spacing.lg }}
        >
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={{
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.full,
                  backgroundColor: active ? colors.brand[700] : colors.surface.raised,
                  borderWidth: 1,
                  borderColor: active ? colors.brand[700] : colors.border.subtle,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: active ? colors.text.inverse : colors.text.secondary,
                  }}
                >
                  {f}
                </Text>
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
        ) : (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing.md,
              paddingHorizontal: spacing.xl,
            }}
          >
            {saved.map((p) => (
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
