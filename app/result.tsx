import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, Image, Pressable, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { AlertCard } from '@/components/AlertCard';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import type { Plant } from '@/data/plants';
import type { IdentifyDetails } from '@/lib/identify';
import { useApp } from '@/state/AppContext';
import { useCatalog } from '@/state/CatalogContext';
import { useUser } from '@/state/UserContext';

type Tab = 'cuidados' | 'plagas' | 'enfermedades' | 'datos';
const TABS: { key: Tab; label: string }[] = [
  { key: 'cuidados', label: 'Cuidados' },
  { key: 'plagas', label: 'Plagas' },
  { key: 'enfermedades', label: 'Enfermedades' },
  { key: 'datos', label: 'Datos' },
];

export default function ResultScreen() {
  const router = useRouter();
  const { toggleSave, isSaved, addIdentification } = useApp();
  const { getPlantById } = useCatalog();
  const { tenant } = useUser();
  const [tab, setTab] = useState<Tab>('cuidados');
  const params = useLocalSearchParams<{
    matchedPlantId?: string;
    commonName?: string;
    scientificName?: string;
    confidence?: string;
    imageUri?: string;
    alternatives?: string;
    details?: string;
  }>();
  const recordedRef = useRef(false);

  const matched = params.matchedPlantId ? getPlantById(params.matchedPlantId) : undefined;
  const confidence = Number(params.confidence ?? '0');
  const lowConfidence = confidence < 60;

  useEffect(() => {
    if (recordedRef.current) return;
    if (!params.commonName || !params.imageUri) return;
    recordedRef.current = true;
    addIdentification({
      commonName: params.commonName,
      scientificName: params.scientificName ?? '',
      matchedPlantId: params.matchedPlantId || undefined,
      imageUri: params.imageUri,
      confidence,
    });
  }, [params.commonName, params.imageUri, params.scientificName, params.matchedPlantId, confidence, addIdentification]);

  let alternatives: { commonName: string; scientificName: string }[] = [];
  try {
    alternatives = params.alternatives ? JSON.parse(params.alternatives) : [];
  } catch {}

  let aiDetails: IdentifyDetails | undefined;
  try {
    aiDetails = params.details ? (JSON.parse(params.details) as IdentifyDetails) : undefined;
  } catch {}

  const view = mergeView(matched, aiDetails, params.commonName, params.scientificName);
  const hasFicha = !!view;

  const handleSave = () => {
    if (matched) toggleSave(matched.id);
  };

  const [waError, setWaError] = useState<string | null>(null);
  const openWhatsapp = async () => {
    const name = view?.commonName ?? 'una planta';
    const phone = tenant.whatsapp;
    if (!phone) {
      setWaError(`Tu vivero no tiene WhatsApp configurado todavía.`);
      return;
    }
    const msg = encodeURIComponent(`Hola ${tenant.shortName}, me interesa la ${name} que identifiqué con la app.`);
    const url = `https://wa.me/${phone}?text=${msg}`;
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) throw new Error('cant-open');
      await Linking.openURL(url);
    } catch {
      setWaError(`No se pudo abrir WhatsApp. Instalá WhatsApp e intentá de nuevo.`);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: spacing.lg,
          }}
        >
          <Pressable
            onPress={() => router.back()}
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
          {matched && (
            <Pressable hitSlop={12} onPress={handleSave}>
              <Ionicons
                name={isSaved(matched.id) ? 'heart' : 'heart-outline'}
                size={24}
                color={isSaved(matched.id) ? colors.semantic.error : colors.text.secondary}
              />
            </Pressable>
          )}
        </View>

        <View style={{ paddingHorizontal: spacing.xl }}>
          <Image
            source={{ uri: params.imageUri ?? matched?.image }}
            style={{
              width: '100%',
              height: 280,
              borderRadius: radius.lg,
              backgroundColor: colors.brand[100],
            }}
            resizeMode="cover"
          />
        </View>

        <View style={{ padding: spacing.xl, gap: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            <View
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: 6,
                borderRadius: radius.full,
                backgroundColor: lowConfidence ? '#FFE8E8' : colors.brand[100],
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: lowConfidence ? colors.semantic.error : colors.brand[900],
                }}
              >
                {confidence}% match
              </Text>
            </View>
            {matched && (
              <View
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: 6,
                  borderRadius: radius.full,
                  backgroundColor: colors.brand[100],
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Ionicons name="leaf" size={12} color={colors.brand[700]} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.brand[900] }}>
                  En {tenant.shortName}
                </Text>
              </View>
            )}
            {lowConfidence && (
              <View
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: 6,
                  borderRadius: radius.full,
                  backgroundColor: '#FFF1DA',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accent.earth }}>
                  Confianza baja
                </Text>
              </View>
            )}
          </View>

          <Text style={typography.displayXl}>{params.commonName ?? 'Planta'}</Text>
          <Text style={[typography.bodyLg, { fontStyle: 'italic', color: colors.text.secondary }]}>
            {params.scientificName ?? '—'}
          </Text>

          {alternatives.length > 0 && (
            <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
              <Text style={typography.headingSm}>¿No es esta? Probá:</Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
                {alternatives.slice(0, 3).map((alt, i) => (
                  <View
                    key={i}
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: radius.full,
                      backgroundColor: colors.surface.raised,
                    }}
                  >
                    <Text style={[typography.bodySm, { fontWeight: '500' }]}>{alt.commonName}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {hasFicha && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}
              style={{
                backgroundColor: colors.surface.base,
                borderBottomWidth: 1,
                borderBottomColor: colors.border.subtle,
                borderTopWidth: 1,
                borderTopColor: colors.border.subtle,
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

            <View style={{ padding: spacing.xl, gap: spacing.lg }}>
              {tab === 'cuidados' && view && (
                <>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                    <CareBox icon="💡" title="Luz" value={view.light} />
                    <CareBox icon="💧" title="Riego" value={view.water} />
                    <CareBox icon="🌡" title="Temp" value={view.temp} />
                    <CareBox
                      icon={view.toxic ? '⚠️' : '✓'}
                      title="Mascotas"
                      value={view.toxic ? 'Tóxica' : 'Segura'}
                    />
                  </View>
                  {view.tips.length > 0 && (
                    <>
                      <Text style={typography.headingMd}>Tips del experto</Text>
                      {view.tips.map((t, i) => (
                        <View key={i} style={{ flexDirection: 'row', gap: spacing.sm }}>
                          <Text style={[typography.bodyMd, { color: colors.brand[500], fontWeight: '700' }]}>
                            •
                          </Text>
                          <Text style={[typography.bodyMd, { flex: 1 }]}>{t}</Text>
                        </View>
                      ))}
                    </>
                  )}
                </>
              )}

              {tab === 'plagas' && view && (
                <View style={{ gap: spacing.md }}>
                  {view.pests.length > 0 ? (
                    <>
                      <Text style={typography.bodySm}>
                        Plagas comunes que afectan a esta planta. Tocá cada una para ver tratamiento.
                      </Text>
                      {view.pests.map((p, i) => (
                        <AlertCard key={i} issue={p} />
                      ))}
                    </>
                  ) : (
                    <EmptyState text="Sin plagas comunes registradas." />
                  )}
                </View>
              )}

              {tab === 'enfermedades' && view && (
                <View style={{ gap: spacing.md }}>
                  {view.diseases.length > 0 ? (
                    <>
                      <Text style={typography.bodySm}>
                        Síntomas frecuentes y cómo tratarlos antes de que empeoren.
                      </Text>
                      {view.diseases.map((d, i) => (
                        <AlertCard key={i} issue={d} />
                      ))}
                    </>
                  ) : (
                    <EmptyState text="Sin enfermedades comunes registradas." />
                  )}
                </View>
              )}

              {tab === 'datos' && view && (
                <View style={{ gap: spacing.md }}>
                  {view.description && <Text style={typography.bodyLg}>{view.description}</Text>}
                  {view.origin && <DataRow label="Origen" value={view.origin} />}
                  <DataRow label="Toxicidad mascotas" value={view.toxic ? 'Sí' : 'No'} />
                  <DataRow label="Nombre científico" value={params.scientificName ?? '—'} />
                  {!matched && aiDetails && (
                    <View
                      style={{
                        marginTop: spacing.md,
                        padding: spacing.md,
                        backgroundColor: colors.brand[50],
                        borderRadius: radius.md,
                        flexDirection: 'row',
                        gap: spacing.sm,
                      }}
                    >
                      <Ionicons name="sparkles" size={16} color={colors.brand[700]} />
                      <Text style={[typography.caption, { flex: 1, color: colors.brand[900] }]}>
                        Ficha generada por AI · Verificá con el equipo de tu vivero antes de aplicar
                        tratamientos.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </>
        )}

        <View style={{ paddingHorizontal: spacing.xl, gap: spacing.md }}>
          {matched ? (
            <>
              <Button
                label="Ver ficha completa"
                onPress={() => router.replace(`/plant/${matched.id}`)}
                fullWidth
                size="lg"
              />
              <Button
                label={isSaved(matched.id) ? '✓ Guardada en Mi Jardín' : 'Guardar en Mi Jardín'}
                onPress={handleSave}
                variant="secondary"
                fullWidth
                size="lg"
              />
            </>
          ) : (
            <Button
              label={`Consultar a ${tenant.shortName} por WhatsApp`}
              onPress={openWhatsapp}
              fullWidth
              size="lg"
              iconLeft={<Ionicons name="logo-whatsapp" size={20} color="#fff" />}
            />
          )}
          {waError && (
            <View
              style={{
                backgroundColor: '#FFE8E8',
                borderRadius: radius.md,
                padding: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
              }}
            >
              <Ionicons name="alert-circle" size={20} color={colors.semantic.error} />
              <Text style={[typography.bodySm, { color: colors.semantic.error, flex: 1 }]}>
                {waError}
              </Text>
              <Pressable onPress={() => setWaError(null)} hitSlop={10}>
                <Ionicons name="close" size={18} color={colors.semantic.error} />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

type FichaView = {
  commonName: string;
  light: string;
  water: string;
  temp: string;
  toxic: boolean;
  tips: string[];
  pests: { name: string; symptoms: string; treatment: string; severity: 'info' | 'warning' | 'danger' }[];
  diseases: { name: string; symptoms: string; treatment: string; severity: 'info' | 'warning' | 'danger' }[];
  description: string;
  origin: string;
};

function mergeView(
  matched: Plant | undefined,
  ai: IdentifyDetails | undefined,
  commonName: string | undefined,
  _scientific: string | undefined,
): FichaView | undefined {
  if (matched) {
    return {
      commonName: matched.commonName,
      light: matched.light,
      water: matched.water,
      temp: matched.temp,
      toxic: matched.toxic,
      tips: matched.tips,
      pests: matched.pests,
      diseases: matched.diseases,
      description: matched.description,
      origin: matched.origin,
    };
  }
  if (ai) {
    return {
      commonName: commonName ?? '',
      light: ai.light,
      water: ai.water,
      temp: ai.temp,
      toxic: ai.toxic,
      tips: ai.tips ?? [],
      pests: ai.pests ?? [],
      diseases: ai.diseases ?? [],
      description: ai.description,
      origin: ai.origin,
    };
  }
  return undefined;
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
      <Text style={[typography.bodySm, { fontWeight: '600', color: colors.brand[900] }]}>
        {value}
      </Text>
    </View>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: colors.border.subtle,
        paddingVertical: spacing.sm,
      }}
    >
      <Text style={typography.caption}>{label}</Text>
      <Text style={typography.bodyMd}>{value}</Text>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View
      style={[
        {
          padding: spacing.lg,
          backgroundColor: colors.surface.raised,
          borderRadius: radius.md,
          alignItems: 'center',
        },
        shadows.card,
      ]}
    >
      <Text style={[typography.bodySm, { color: colors.text.secondary }]}>{text}</Text>
    </View>
  );
}
