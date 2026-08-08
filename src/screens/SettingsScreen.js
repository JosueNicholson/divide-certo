import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { languages } from '../i18n';

export default function SettingsScreen({ language, setLanguage, t, onBack }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={onBack} accessibilityLabel={t.back} style={styles.backButton}><Text style={styles.backArrow}>‹</Text></Pressable>
          <Text style={styles.headerTitle}>{t.appSettings}</Text>
        </View>
        <Text style={styles.eyebrow}>{t.appSettings.toUpperCase()}</Text>
        <Text style={styles.title}>{t.language}</Text>
        <View style={styles.card}>
          <Text style={styles.description}>{t.languageDescription}</Text>
          {languages.map(({ code, label }) => (
            <Pressable key={code} accessibilityLabel={label} accessibilityState={{ selected: language === code }} onPress={() => setLanguage(code)} style={styles.option}>
              <Text style={styles.optionText}>{label}</Text>
              {language === code && <Text style={styles.selectedCheck}>✓</Text>}
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>{t.languageSystem}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F3' }, content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 }, header: { height: 72, flexDirection: 'row', alignItems: 'center' }, backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E9EEEA', alignItems: 'center', justifyContent: 'center', marginRight: 12 }, backArrow: { color: '#1E3D35', fontSize: 34, fontWeight: '300', lineHeight: 32, marginTop: -3 }, headerTitle: { color: '#1E3D35', fontSize: 17, fontWeight: '800', letterSpacing: -0.4 },
  eyebrow: { color: '#6C817A', fontSize: 11, fontWeight: '800', letterSpacing: 1.4 }, title: { color: '#1E3D35', fontSize: 31, lineHeight: 36, fontWeight: '800', letterSpacing: -1.2, marginTop: 9, marginBottom: 28 }, card: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 18 }, description: { color: '#71807A', fontSize: 14, lineHeight: 20, paddingTop: 18, paddingBottom: 9 }, option: { minHeight: 59, borderTopWidth: 1, borderTopColor: '#EDF0ED', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, optionText: { color: '#1E3D35', fontSize: 16, fontWeight: '700' }, selectedCheck: { color: '#1E3D35', fontSize: 20, fontWeight: '800' }, hint: { color: '#71807A', fontSize: 13, lineHeight: 19, marginTop: 14 },
});
