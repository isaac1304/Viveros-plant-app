import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/state/UserContext';
import { mapAuthError } from '@/lib/auth';
import { colors, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

type Field = 'name' | 'email' | 'password' | 'tenantCode' | null;

export default function SignUp() {
  const { signUp, status } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tenantCode, setTenantCode] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [errorField, setErrorField] = useState<Field>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Same race-avoidance pattern as sign-in: route guard handles navigation
  // once status flips to 'authenticated'. Reset submitting if it falls back
  // to 'unauthenticated' (ensureUserDoc threw, etc.).
  useEffect(() => {
    if (status === 'unauthenticated') setSubmitting(false);
  }, [status]);

  const validate = (): { ok: true } | { ok: false; field: Field; message: string } => {
    if (!tenantCode.trim())
      return { ok: false, field: 'tenantCode', message: 'Pediselo a tu vivero (ej. ZAMORANO).' };
    if (!name.trim()) return { ok: false, field: 'name', message: 'Decinos cómo te llamamos.' };
    if (!email.trim()) return { ok: false, field: 'email', message: 'Necesitamos un correo.' };
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      return { ok: false, field: 'email', message: 'El correo no es válido.' };
    if (password.length < 6)
      return { ok: false, field: 'password', message: 'Mínimo 6 caracteres.' };
    return { ok: true };
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setError(null);
    setErrorField(null);
    const v = validate();
    if (!v.ok) {
      setErrorField(v.field);
      setError(v.message);
      return;
    }
    setSubmitting(true);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        tenantCode: tenantCode.trim(),
        city: city.trim() || undefined,
      });
      // Stay 'submitting' — route guard navigates once status === 'authenticated'.
    } catch (err) {
      const msg = mapAuthError(err);
      setError(msg);
      // Highlight the field most likely to be the cause of the failure.
      const code = (err as { code?: string })?.code ?? '';
      if (code === 'tenant/not-found') setErrorField('tenantCode');
      else if (code === 'auth/weak-password') setErrorField('password');
      else setErrorField('email');
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
          <View style={{ gap: spacing.sm, paddingTop: spacing.lg }}>
            <Text style={[typography.displayLg, { color: colors.brand[900] }]}>Creá tu cuenta</Text>
            <Text style={[typography.bodyMd, { color: colors.text.secondary }]}>
              Guardá tu jardín, escaneá QRs y recibí recordatorios de riego de tu vivero.
            </Text>
          </View>

          <View style={{ gap: spacing.lg }}>
            <TextField
              label="Código de tu vivero"
              hint="El que te dio el vivero al comprar (ej. ZAMORANO)."
              value={tenantCode}
              onChangeText={setTenantCode}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="ZAMORANO"
              error={errorField === 'tenantCode' ? error : null}
            />
            <TextField
              label="Tu nombre"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              placeholder="María"
              error={errorField === 'name' ? error : null}
            />
            <TextField
              label="Correo"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="vos@correo.com"
              error={errorField === 'email' ? error : null}
            />
            <TextField
              label="Ciudad"
              hint="Opcional — para personalizar tips de clima."
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              placeholder="Cartago"
            />
            <TextField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              textContentType="newPassword"
              placeholder="Mínimo 6 caracteres"
              error={errorField === 'password' ? error : null}
            />
          </View>

          <View style={{ gap: spacing.md, marginTop: 'auto' }}>
            <Button
              label={submitting ? 'Creando cuenta…' : 'Crear cuenta'}
              onPress={handleSubmit}
              fullWidth
              size="lg"
              loading={submitting}
            />

            <Link href="/(auth)/sign-in" asChild>
              <Pressable hitSlop={10} style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
                <Text style={[typography.bodyMd, { color: colors.brand[700], fontWeight: '600' }]}>
                  Ya tengo cuenta — iniciar sesión
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
