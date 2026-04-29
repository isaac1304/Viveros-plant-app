import { ScrollView, View, Text, Image, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { useApp, type IdentificationEntry } from '@/state/AppContext';

export default function History() {
  const router = useRouter();
  const { history, clearHistory } = useApp();

  const onClear = () => {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (window.confirm('¿Borrar todo el historial de identificaciones?')) clearHistory();
      return;
    }
    Alert.alert('Borrar historial', '¿Querés borrar todas las identificaciones?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: clearHistory },
    ]);
  };

  return (
    <ScreenContainer>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.full,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        {history.length > 0 && (
          <Pressable onPress={onClear} hitSlop={8}>
            <Text style={[typography.bodySm, { color: colors.semantic.error, fontWeight: '600' }]}>
              Borrar
            </Text>
          </Pressable>
        )}
      </View>

      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.lg }}>
        <Text style={typography.displayLg}>Identificaciones</Text>
        <Text style={[typography.bodySm, { marginTop: 4 }]}>
          {history.length === 0
            ? 'Aún no has identificado plantas'
            : `${history.length} ${history.length === 1 ? 'planta' : 'plantas'}`}
        </Text>
      </View>

      {history.length === 0 ? (
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
            <Ionicons name="time-outline" size={48} color={colors.brand[500]} />
          </View>
          <Text style={[typography.headingMd, { textAlign: 'center' }]}>Sin identificaciones</Text>
          <Text style={[typography.bodySm, { textAlign: 'center', maxWidth: 260 }]}>
            Cada planta que identifiques con foto o QR queda guardada acá para que la consultes después.
          </Text>
          <Button label="Identificar planta" onPress={() => router.replace('/camera')} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing['3xl'], gap: spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          {history.map((entry) => (
            <HistoryRow key={entry.id} entry={entry} onPress={() => onOpen(entry, router)} />
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

function onOpen(entry: IdentificationEntry, router: ReturnType<typeof useRouter>) {
  if (entry.matchedPlantId) {
    router.push(`/plant/${entry.matchedPlantId}`);
  }
}

function HistoryRow({ entry, onPress }: { entry: IdentificationEntry; onPress: () => void }) {
  const disabled = !entry.matchedPlantId;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          gap: spacing.md,
          backgroundColor: colors.surface.raised,
          borderRadius: radius.md,
          overflow: 'hidden',
          opacity: pressed ? 0.92 : 1,
        },
        shadows.card,
      ]}
    >
      <Image
        source={{ uri: entry.imageUri }}
        style={{ width: 96, height: 96, backgroundColor: colors.brand[100] }}
      />
      <View style={{ flex: 1, padding: spacing.md, justifyContent: 'center', gap: 4 }}>
        <Text style={[typography.headingSm]} numberOfLines={1}>
          {entry.commonName}
        </Text>
        {entry.scientificName ? (
          <Text
            style={[typography.bodySm, { fontStyle: 'italic', color: colors.text.secondary }]}
            numberOfLines={1}
          >
            {entry.scientificName}
          </Text>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 }}>
          <Text style={[typography.caption, { color: colors.text.tertiary }]}>
            {formatDate(entry.timestamp)}
          </Text>
          <View
            style={{
              paddingHorizontal: 6,
              paddingVertical: 1,
              borderRadius: radius.full,
              backgroundColor: entry.confidence >= 60 ? colors.brand[100] : '#FFF1DA',
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: entry.confidence >= 60 ? colors.brand[900] : colors.accent.earth,
              }}
            >
              {entry.confidence}%
            </Text>
          </View>
        </View>
      </View>
      {!disabled && (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingRight: spacing.md }}>
          <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
        </View>
      )}
    </Pressable>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('es-CR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
