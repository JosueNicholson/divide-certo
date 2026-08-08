import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function HomeScreen({ t, onStart, onOpenSettings }) {
  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <StatusBar style="dark" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <ScrollView contentContainerClassName="flex-grow px-6 pb-7" keyboardShouldPersistTaps="handled">
          <View className="h-[72px] flex-row items-center">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#1E3D35]"><Text className="-mt-0.5 text-[25px] font-bold text-[#E9F06B]">÷</Text></View>
            <Text className="ml-[9px] text-lg font-bold tracking-[-0.5px] text-[#1E3D35]">divide certo</Text>
            <Pressable onPress={onOpenSettings} accessibilityLabel={t.settings} className="ml-auto h-10 w-10 items-center justify-center rounded-full bg-[#E9EEEA]">
              <Text className="text-[19px] text-[#1E3D35]">⚙</Text>
            </Pressable>
          </View>
          <View className="mb-[30px] mt-[30px]"><Text className="mt-2.5 text-[42px] font-extrabold leading-[45px] tracking-[-1.8px] text-[#1E3D35]">{t.homeTitle.replace('{line}', '\n')}</Text></View>
          <Pressable onPress={onStart} className={({ pressed }) => `h-[60px] flex-row items-center justify-between rounded-[18px] px-[22px] ${pressed ? 'bg-[#31564B]' : 'bg-[#1E3D35]'}`}>
            <Text className="text-base font-extrabold text-[#F3F78D]">{t.start}</Text><Text className="text-[25px] font-normal text-[#F3F78D]">→</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
