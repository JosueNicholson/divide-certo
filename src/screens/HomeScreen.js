import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen({ t, onStart, onOpenSettings }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logo}><Text style={styles.logoMark}>÷</Text></View>
            <Text style={styles.brand}>divide certo</Text>
            <Pressable onPress={onOpenSettings} accessibilityLabel={t.settings} style={styles.settingsButton}>
              <Text style={styles.settingsIcon}>⚙</Text>
            </Pressable>
          </View>
          <View style={styles.intro}><Text style={styles.title}>{t.homeTitle.replace('{line}', '\n')}</Text></View>
          <Pressable onPress={onStart} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}>
            <Text style={styles.primaryText}>{t.start}</Text><Text style={styles.arrow}>→</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F3' }, flex: { flex: 1 }, content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 28 },
  header: { height: 72, flexDirection: 'row', alignItems: 'center' }, logo: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E3D35', alignItems: 'center', justifyContent: 'center' }, logoMark: { color: '#E9F06B', fontSize: 25, fontWeight: '700', marginTop: -2 }, brand: { marginLeft: 9, color: '#1E3D35', fontSize: 18, fontWeight: '700', letterSpacing: -0.5 },
  settingsButton: { marginLeft: 'auto', width: 40, height: 40, borderRadius: 20, backgroundColor: '#E9EEEA', alignItems: 'center', justifyContent: 'center' }, settingsIcon: { color: '#1E3D35', fontSize: 19 }, intro: { marginTop: 30, marginBottom: 30 }, title: { color: '#1E3D35', fontSize: 42, lineHeight: 45, fontWeight: '800', letterSpacing: -1.8, marginTop: 10 },
  primaryButton: { height: 60, backgroundColor: '#1E3D35', borderRadius: 18, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, primaryPressed: { backgroundColor: '#31564B' }, primaryText: { color: '#F3F78D', fontSize: 16, fontWeight: '800' }, arrow: { color: '#F3F78D', fontSize: 25, fontWeight: '400' },
});
