import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useSessionStore } from '@/entities/session';
import { colors } from '@/shared/config';

type Mode = 'login' | 'signup';

export function AuthPage() {
  const login = useSessionStore((s) => s.login);
  const signup = useSessionStore((s) => s.signup);
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
      if (mode === 'login') await login(emailOrId.trim(), password);
      else await signup({ email: emailOrId.trim(), studentId: studentId.trim(), name: name.trim(), password });
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <View className="w-full max-w-[420px] self-center rounded-lg border border-border bg-surface p-6">
          <View className="mb-6 items-center">
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-md bg-primary">
              <Text className="text-[28px] font-extrabold text-white">D</Text>
            </View>
            <Text className="text-2xl font-extrabold text-text">DayLog</Text>
            <Text className="mt-1 text-[13px] text-textMuted">일상을 일자별로 기록하고 나눠요</Text>
          </View>

          <View className="mb-5 flex-row rounded-pill bg-surfaceAlt p-1">
            {(['login', 'signup'] as Mode[]).map((m) => {
              const on = mode === m;
              return (
                <Pressable
                  key={m}
                  className={`flex-1 items-center rounded-pill py-2 ${on ? 'bg-primary' : ''}`}
                  onPress={() => {
                    setMode(m);
                    setError(null);
                  }}
                >
                  <Text className={`font-bold ${on ? 'text-white' : 'text-textMuted'}`}>
                    {m === 'login' ? '로그인' : '회원가입'}
                  </Text>
                </Pressable>
              );
            })}
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

          {!!error && <Text className="mb-3 text-[13px] text-danger">{error}</Text>}

          <Pressable
            className="mt-1 items-center rounded-md bg-primary py-4"
            style={busy && { opacity: 0.6 }}
            onPress={submit}
            disabled={busy}
          >
            <Text className="text-base font-extrabold text-white">
              {busy ? '처리 중…' : mode === 'login' ? '로그인' : '가입하고 시작하기'}
            </Text>
          </Pressable>

          <Text className="mt-4 text-center text-[11px] text-textMuted">
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
    <View className="mb-4">
      <Text className="mb-1 text-[13px] text-textMuted">{label}</Text>
      <TextInput
        className="rounded-md border border-border bg-surfaceAlt px-4 py-3 text-text"
        placeholderTextColor={colors.textMuted}
        {...props}
      />
    </View>
  );
}
