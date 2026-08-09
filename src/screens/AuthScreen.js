import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';

WebBrowser.maybeCompleteAuthSession();

const redirectTo = AuthSession.makeRedirectUri({
  path: 'auth/callback',
  scheme: 'dividecerto',
});

export default function AuthScreen({ isLoading, isSupabaseConfigured, onOpenSettings, t }) {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signInWithGoogle = async () => {
    if (!supabase) return;

    setIsSigningIn(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      setIsSigningIn(false);
      Alert.alert(t.signInErrorTitle, t.signInError);
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success') {
      const code = new URL(result.url).searchParams.get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) Alert.alert(t.signInErrorTitle, t.signInError);
      }
    }

    setIsSigningIn(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <View className="flex-row items-center px-6 pt-4">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#1E3D35]">
          <Text className="-mt-0.5 text-[25px] font-bold text-[#E9F06B]">÷</Text>
        </View>
        <Text className="ml-[9px] text-lg font-bold tracking-[-0.5px] text-[#1E3D35]">
          divide certo
        </Text>
        <Pressable
          accessibilityLabel={t.settings}
          className="ml-auto h-10 w-10 items-center justify-center rounded-full bg-[#E9EEEA]"
          onPress={onOpenSettings}
        >
          <Text className="text-[19px] text-[#1E3D35]">⚙</Text>
        </Pressable>
      </View>
      <View className="flex-1 justify-center px-6 pb-20">
        <Text className="text-[42px] font-extrabold leading-[45px] tracking-[-1.8px] text-[#1E3D35]">
          {t.signInTitle.replace('{line}', '\n')}
        </Text>
        <Text className="mt-5 text-base leading-6 text-[#526760]">{t.signInDescription}</Text>
        <Pressable
          accessibilityLabel={t.continueWithGoogle}
          className="mt-9 h-[60px] flex-row items-center justify-center rounded-[18px] bg-[#1E3D35] active:bg-[#31564B]"
          disabled={isLoading || isSigningIn || !isSupabaseConfigured}
          onPress={signInWithGoogle}
        >
          {isLoading || isSigningIn ? (
            <ActivityIndicator color="#F3F78D" />
          ) : (
            <>
              <Text className="mr-2 text-lg font-bold text-[#F3F78D]">G</Text>
              <Text className="text-base font-extrabold text-[#F3F78D]">
                {t.continueWithGoogle}
              </Text>
            </>
          )}
        </Pressable>
        {!isSupabaseConfigured && (
          <Text className="mt-4 text-center text-xs leading-5 text-[#71807A]">
            {t.backendNotConfigured}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
