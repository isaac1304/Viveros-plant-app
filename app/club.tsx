import { useState } from 'react';
import { Alert, Platform, ScrollView, View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TabBar } from '@/components/TabBar';
import { Button } from '@/components/Button';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { articles } from '@/data/plants';
import { useAuth, useUser, membershipLabel } from '@/state/UserContext';

const BENEFITS = [
  { icon: 'pricetag' as const, label: '15% descuento en plantas' },
  { icon: 'calendar' as const, label: 'Eventos y talleres prioritarios' },
  { icon: 'gift' as const, label: 'Regalo de cumpleaños' },
  { icon: 'chatbubbles' as const, label: 'Asesoría personalizada' },
];

export default function Club() {
  const user = useUser();
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const confirmSignOut = () => {
    if (signingOut) return;
    // Web has no native Alert.alert dialog; just sign out directly there.
    if (Platform.OS === 'web') {
      void doSignOut();
      return;
    }
    Alert.alert(
      'Cerrar sesión',
      `Vas a salir de tu cuenta en ${user.tenant.shortName}. Tus datos quedan guardados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: () => void doSignOut() },
      ],
    );
  };

  const doSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      // Route guard in app/_layout.tsx redirects to /(auth)/sign-in once
      // status flips to 'unauthenticated'.
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <ScreenContainer withTabBarPadding>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing['2xl'] }} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1000&q=80',
            }}
            style={{ width: '100%', height: 200, backgroundColor: colors.brand[100] }}
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(15,61,46,0.55)',
            }}
          />
          <View style={{ position: 'absolute', bottom: spacing.lg, left: spacing.xl, right: spacing.xl }}>
            <Text style={[typography.caption, { color: colors.brand[100], textTransform: 'uppercase' }]}>
              1 247 miembros
            </Text>
            <Text style={[typography.displayLg, { color: '#fff' }]}>Club de Plantas {user.tenant.shortName}</Text>
          </View>
        </View>

        {/* Membership card */}
        <View
          style={[
            {
              marginHorizontal: spacing.xl,
              marginTop: -spacing.lg,
              backgroundColor: colors.surface.raised,
              borderRadius: radius.lg,
              padding: spacing.xl,
              gap: spacing.md,
            },
            shadows.raised,
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.accent.sun,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="star" size={24} color={colors.surface.raised} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.headingSm}>
                {user.name}, sos miembro {membershipLabel(user.membership)}
              </Text>
              {user.memberSince && (
                <Text style={typography.bodySm}>Desde {user.memberSince}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Benefits */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xl, gap: spacing.md }}>
          <Text style={typography.headingMd}>Tus beneficios</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
            {BENEFITS.map((b, i) => (
              <View
                key={i}
                style={[
                  {
                    flexBasis: '47%',
                    flexGrow: 1,
                    backgroundColor: colors.brand[50],
                    borderRadius: radius.md,
                    padding: spacing.lg,
                    gap: spacing.sm,
                    minHeight: 110,
                  },
                ]}
              >
                <Ionicons name={b.icon} size={24} color={colors.brand[700]} />
                <Text style={[typography.bodySm, { fontWeight: '600', color: colors.brand[900] }]}>
                  {b.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming events */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xl, gap: spacing.md }}>
          <Text style={typography.headingMd}>Próximos eventos</Text>
          {articles.map((a) => (
            <View
              key={a.id}
              style={[
                {
                  flexDirection: 'row',
                  gap: spacing.md,
                  backgroundColor: colors.surface.raised,
                  borderRadius: radius.md,
                  overflow: 'hidden',
                },
                shadows.card,
              ]}
            >
              <Image source={{ uri: a.image }} style={{ width: 100, height: 100 }} />
              <View style={{ flex: 1, padding: spacing.md, justifyContent: 'center', gap: 4 }}>
                <Text style={typography.headingSm} numberOfLines={2}>
                  {a.title}
                </Text>
                <Text style={typography.bodySm} numberOfLines={2}>
                  {a.excerpt}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ padding: spacing.xl, gap: spacing.md }}>
          <Button label="Ver historial completo" variant="secondary" onPress={() => {}} fullWidth />
          <Button
            label={signingOut ? 'Cerrando…' : 'Cerrar sesión'}
            variant="ghost"
            onPress={confirmSignOut}
            loading={signingOut}
            fullWidth
            iconLeft={<Ionicons name="log-out-outline" size={18} color={colors.brand[700]} />}
          />
        </View>
      </ScrollView>

      <TabBar />
    </ScreenContainer>
  );
}
