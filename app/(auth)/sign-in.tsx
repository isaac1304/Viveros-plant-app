import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/state/UserContext';
import { mapAuthError } from '@/lib/auth';
import { colors, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setError(null);
    if (!email.trim() || !password) {
      setError('Completá correo y contraseña.');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/home');
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: 'center', paddingTop: spacing.xl }}>
            <Logo size={96} />
          </View>

          <View style={{ gap: spacing.sm }}>
            <Text style={[typography.displayLg, { color: colors.brand[900] }]}>Bienvenida de vuelta</Text>
            <Text style={[typography.bodyMd, { color: colors.text.secondary }]}>
              Iniciá sesión para abrir tu jardín, historial y recordatorios.
            </Text>
          </View>

          <View style={{ gap: spacing.lg }}>
            <TextField
              label="Correo"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="vos@correo.com"
            />
            <TextField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              placeholder="••••••••"
              error={error}
            />
          </View>

          <View style={{ gap: spacing.md, marginTop: 'auto' }}>
            <Button
              label={submitting ? 'Entrando…' : 'Iniciar sesión'}
              onPress={handleSubmit}
              fullWidth
              size="lg"
              loading={submitting}
            />

            <Link href="/(auth)/sign-up" asChild>
              <Pressable hitSlop={10} style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
                <Text style={[typography.bodyMd, { color: colors.brand[700], fontWeight: '600' }]}>
                  No tengo cuenta — crear una
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
