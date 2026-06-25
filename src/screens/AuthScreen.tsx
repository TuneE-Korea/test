import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useApp } from '../store/AppContext';
import { colors, radius, spacing } from '../theme';

type Mode = 'login' | 'signup';

export function AuthScreen() {
  const { login, signup } = useApp();
  const [mode, setMode] = useState<Mode>('login');
  const [emailOrId, setEmailOrId] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!emailOrId.trim() || !password.trim()) {
      setError('이메일/학번과 비밀번호를 입력하세요.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(emailOrId.trim(), password);
      } else {
        await signup({
          email: emailOrId.trim(),
          studentId: studentId.trim(),
          name: name.trim(),
          password,
        });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoTxt}>D</Text>
            </View>
            <Text style={styles.title}>DayLog</Text>
            <Text style={styles.subtitle}>일상을 일자별로 기록하고 나눠요</Text>
          </View>

          <View style={styles.tabs}>
            {(['login', 'signup'] as Mode[]).map((m) => (
              <Pressable
                key={m}
                style={[styles.tab, mode === m && styles.tabActive]}
                onPress={() => {
                  setMode(m);
                  setError(null);
                }}
              >
                <Text style={[styles.tabTxt, mode === m && styles.tabTxtActive]}>
                  {m === 'login' ? '로그인' : '회원가입'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Field
            label="이메일 또는 학번"
            value={emailOrId}
            onChangeText={setEmailOrId}
            placeholder="you@univ.ac.kr 또는 20211234"
            autoCapitalize="none"
          />

          {mode === 'signup' && (
            <>
              <Field label="이름" value={name} onChangeText={setName} placeholder="홍길동" />
              <Field
                label="학번"
                value={studentId}
                onChangeText={setStudentId}
                placeholder="20211234"
                keyboardType="number-pad"
              />
            </>
          )}

          <Field
            label="비밀번호"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable style={[styles.submit, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
            <Text style={styles.submitTxt}>
              {busy ? '처리 중…' : mode === 'login' ? '로그인' : '가입하고 시작하기'}
            </Text>
          </Pressable>

          <Text style={styles.hint}>
            데모 환경입니다. 비밀번호 검증 없이 입력값으로 바로 입장합니다.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing(5) },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(6),
    borderWidth: 1,
    borderColor: colors.border,
  },
  brand: { alignItems: 'center', marginBottom: spacing(6) },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(3),
  },
  logoTxt: { color: '#fff', fontWeight: '800', fontSize: 28 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing(5),
  },
  tab: { flex: 1, paddingVertical: spacing(2), alignItems: 'center', borderRadius: radius.pill },
  tabActive: { backgroundColor: colors.primary },
  tabTxt: { color: colors.textMuted, fontWeight: '700' },
  tabTxtActive: { color: '#fff' },
  field: { marginBottom: spacing(4) },
  fieldLabel: { color: colors.textMuted, fontSize: 13, marginBottom: spacing(1) },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing(3) },
  submit: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing(4),
    alignItems: 'center',
    marginTop: spacing(1),
  },
  submitTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  hint: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: spacing(4) },
});
