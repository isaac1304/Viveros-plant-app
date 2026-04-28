import { View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import type { Plant } from '@/data/plants';
import { InfoChip } from './InfoChip';

type Props = {
  plant: Plant;
  variant?: 'compact' | 'full';
};

export function PlantCard({ plant, variant = 'compact' }: Props) {
  const router = useRouter();
  const width = variant === 'compact' ? 160 : '100%';
  const imageHeight = variant === 'compact' ? 140 : 160;

  return (
    <Pressable
      onPress={() => router.push(`/plant/${plant.id}`)}
      style={({ pressed }) => [
        {
          width: width as any,
          backgroundColor: colors.surface.raised,
          borderRadius: radius.lg,
          overflow: 'hidden',
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        shadows.card,
      ]}
    >
      <Image
        source={{ uri: plant.image }}
        style={{ width: '100%', height: imageHeight, backgroundColor: colors.brand[100] }}
        resizeMode="cover"
      />
      <View style={{ padding: spacing.md, gap: 6 }}>
        <Text style={typography.headingSm} numberOfLines={2}>
          {plant.commonName}
        </Text>
        <Text style={[typography.bodySm, { fontStyle: 'italic' }]} numberOfLines={1}>
          {plant.scientificName}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          <InfoChip icon="💡" label={plant.light.split(' ')[0]} />
          <InfoChip icon="💧" label={plant.water} />
        </View>
      </View>
    </Pressable>
  );
}
