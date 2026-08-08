import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { languages } from '../i18n';

export default function SettingsScreen({ language, setLanguage, t, onBack }) {
  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <StatusBar style="dark" />
      <ScrollView contentContainerClassName="flex-grow px-6 pb-8">
        <View className="h-[72px] flex-row items-center">
          <Pressable onPress={onBack} accessibilityLabel={t.back} className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-[#E9EEEA]"><Text className="-mt-[3px] text-[34px] font-light leading-8 text-[#1E3D35]">‹</Text></Pressable>
          <Text className="text-[17px] font-extrabold tracking-[-0.4px] text-[#1E3D35]">{t.appSettings}</Text>
        </View>
        <Text className="text-[11px] font-extrabold tracking-[1.4px] text-[#6C817A]">{t.appSettings.toUpperCase()}</Text>
        <Text className="mb-7 mt-[9px] text-[31px] font-extrabold leading-9 tracking-[-1.2px] text-[#1E3D35]">{t.language}</Text>
        <View className="rounded-[20px] bg-white px-[18px]">
          <Text className="pb-[9px] pt-[18px] text-sm leading-5 text-[#71807A]">{t.languageDescription}</Text>
          {languages.map(({ code, label }) => (
            <Pressable key={code} accessibilityLabel={label} accessibilityState={{ selected: language === code }} onPress={() => setLanguage(code)} className="min-h-[59px] flex-row items-center justify-between border-t border-[#EDF0ED]">
              <Text className="text-base font-bold text-[#1E3D35]">{label}</Text>
              {language === code && <Text className="text-xl font-extrabold text-[#1E3D35]">✓</Text>}
            </Pressable>
          ))}
        </View>
        <Text className="mt-[14px] text-[13px] leading-[19px] text-[#71807A]">{t.languageSystem}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
