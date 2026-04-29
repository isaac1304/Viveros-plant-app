import { useState } from 'react';
import { ScrollView, View, Text, Image, Pressable, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { InfoChip } from '@/components/InfoChip';
import { AlertCard } from '@/components/AlertCard';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { getPlantById } from '@/data/plants';
import { useApp } from '@/state/AppContext';

type Tab = 'cuidados' | 'plagas' | 'enfermedades' | 'datos' | 'zamorano';
const TABS: { key: Tab; label: string }[] = [
  { key: 'cuidados', label: 'Cuidados' },
  { key: 'plagas', label: 'Plagas' },
  { key: 'enfermedades', label: 'Enfermedades' },
  { key: 'datos', label: 'Datos' },
  { key: 'zamorano', label: 'En Zamorano' },
];

const ZAMORANO_PHONE = '50622688257';

export default function PlantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const plant = getPlantById(id);
  const { isSaved, toggleSave } = useApp();
  const [tab, setTab] = useState<Tab>('cuidados');

  if (!plant) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
          <Text style={typography.headingMd}>Planta no encontrada</Text>
          <Button label="Volver" onPress={() => router.back()} variant="ghost" />
        </View>
      </ScreenContainer>
    );
  }

  const saved = isSaved(plant.id);

  const openWhatsapp = async () => {
    const msg = encodeURIComponent(`Hola Zamorano, me interesa la ${plant.commonName} que vi en la app.`);
    const url = `https://wa.me/${ZAMORANO_PHONE}?text=${msg}`;
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) throw new Error('cant-open');
      await Linking.openURL(url);
    } catch {
      // Silently fail — UI can be enhanced later. WhatsApp may not be installed.
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface.base }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing['3xl'] }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: plant.image }}
            style={{ width: '100%', height: 340, backgroundColor: colors.brand[100] }}
            resizeMode="cover"
          />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 140,
              backgroundColor: 'rgba(0,0,0,0.45)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 60,
              left: spacing.lg,
              right: spacing.lg,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <RoundButton icon="arrow-back" onPress={() => router.back()} />
            <RoundButton
              icon={saved ? 'heart' : 'heart-outline'}
              onPress={() => toggleSave(plant.id)}
              tint={saved ? colors.semantic.error : '#fff'}
            />
          </View>
          <View style={{ position: 'absolute', bottom: spacing.lg, left: spacing.xl, right: spacing.xl }}>
            <Text style={[typography.displayXl, { color: '#fff' }]}>{plant.commonName}</Text>
            <Text style={[typography.bodyLg, { color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' }]}>
              {plant.scientificName}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}
          style={{
            backgroundColor: colors.surface.base,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.subtle,
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                style={{
                  paddingVertical: spacing.lg,
                  borderBottomWidth: 3,
                  borderBottomColor: active ? colors.brand[500] : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: active ? colors.brand[700] : colors.text.secondary,
                  }}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Tab content */}
        <View style={{ padding: spacing.xl, gap: spacing.lg }}>
          {tab === 'cuidados' && (
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                <CareBox icon="💡" title="Luz" value={plant.light} />
                <CareBox icon="💧" title="Riego" value={plant.water} />
                <CareBox icon="🌡" title="Temp" value={plant.temp} />
                <CareBox
                  icon={plant.toxic ? '⚠️' : '✓'}
                  title="Mascotas"
                  value={plant.toxic ? 'Tóxica' : 'Segura'}
                />
              </View>
              <Text style={typography.headingMd}>Tips del experto</Text>
              {plant.tips.map((t, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Text style={[typography.bodyMd, { color: colors.brand[500], fontWeight: '700' }]}>•</Text>
                  <Text style={[typography.bodyMd, { flex: 1 }]}>{t}</Text>
                </View>
              ))}
            </>
          )}

          {tab === 'plagas' && (
            <View style={{ gap: spacing.md }}>
              <Text style={typography.bodySm}>
                Plagas comunes que afectan a esta planta. Tocá cada una para ver tratamiento.
              </Text>
              {plant.pests.map((p, i) => (
                <AlertCard key={i} issue={p} />
              ))}
            </View>
          )}

          {tab === 'enfermedades' && (
            <View style={{ gap: spacing.md }}>
              <Text style={typography.bodySm}>
                Síntomas frecuentes y cómo tratarlos antes de que empeoren.
              </Text>
              {plant.diseases.map((d, i) => (
                <AlertCard key={i} issue={d} />
              ))}
            </View>
          )}

          {tab === 'datos' && (
            <View style={{ gap: spacing.lg }}>
              <Text style={typography.bodyLg}>{plant.description}</Text>
              <DataRow label="Origen" value={plant.origin} />
              <DataRow label="Toxicidad mascotas" value={plant.toxic ? 'Sí' : 'No'} />
              <DataRow label="Nombre científico" value={plant.scientificName} />
            </View>
          )}

          {tab === 'zamorano' && (
            <View style={{ gap: spacing.lg }}>
              {plant.inStore ? (
                <View
                  style={[
                    {
                      backgroundColor: colors.surface.raised,
                      borderRadius: radius.lg,
                      padding: spacing.lg,
                      gap: spacing.md,
                    },
                    shadows.card,
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.semantic.success,
                      }}
                    />
                    <Text style={[typography.bodySm, { color: colors.semantic.success, fontWeight: '700' }]}>
                      Disponible en el vivero
                    </Text>
                  </View>
                  <Text style={typography.displayLg}>{plant.price}</Text>
                  <Text style={typography.bodySm}>
                    Vivero El Zamorano · Cartago{'\n'}Lun-Sáb 7:30am-5:00pm · Dom 9:30am-5:00pm
                  </Text>
                  <Button
                    label="Reservar por WhatsApp"
                    onPress={openWhatsapp}
                    fullWidth
                    iconLeft={<Ionicons name="logo-whatsapp" size={20} color="#fff" />}
                  />
                </View>
              ) : (
                <Text style={typography.bodyMd}>
                  Esta planta no está disponible en tienda actualmente. Te avisamos cuando llegue.
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function RoundButton({
  icon,
  onPress,
  tint = '#fff',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  tint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: radius.full,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Ionicons name={icon} size={22} color={tint} />
    </Pressable>
  );
}

function CareBox({ icon, title, value }: { icon: string; title: string; value: string }) {
  return (
    <View
      style={{
        flexBasis: '47%',
        flexGrow: 1,
        backgroundColor: colors.brand[50],
        borderRadius: radius.md,
        padding: spacing.lg,
        gap: 4,
      }}
    >
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={[typography.caption, { color: colors.text.secondary }]}>{title}</Text>
      <Text style={[typography.bodySm, { fontWeight: '600', color: colors.brand[900] }]}>{value}</Text>
    </View>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border.subtle, paddingVertical: spacing.sm }}>
      <Text style={typography.caption}>{label}</Text>
      <Text style={typography.bodyMd}>{value}</Text>
    </View>
  );
}
