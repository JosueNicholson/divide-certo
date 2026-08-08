import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import SplitTypeModal from '../components/SplitTypeModal';
import { money } from '../utils/currency';
import { formatCents, parseBrazilianNumber } from '../utils/formatters';

export default function CustomizeScreen({ amount, setAmount, total, people, changePeople, names, setNames, splitType, setSplitType, t, locale, onBack }) {
  const [details, setDetails] = useState(() => names.map(() => ''));
  const [isSplitSelectOpen, setIsSplitSelectOpen] = useState(false);
  const equalPercentage = (100 / names.length).toFixed(names.length === 3 ? 2 : 1).replace('.', ',');
  const splitOptions = [['equal', t.equal, t.equalCaption], ['percentage', t.percentage, t.percentageCaption], ['amount', t.amount, t.amountCaption]];
  const selectedSplit = splitOptions.find(([type]) => type === splitType);
  const percentageTotal = details.reduce((sum, detail) => sum + (Number.parseInt(detail, 10) || 0), 0);
  const specificAmountTotal = details.reduce((sum, detail) => sum + parseBrazilianNumber(detail), 0);
  const validation = splitType === 'percentage' && percentageTotal > 100
    ? { type: 'error', message: t.percentageOver(percentageTotal) }
    : splitType === 'amount' && specificAmountTotal > total
      ? { type: 'error', message: t.amountOver(money(specificAmountTotal, locale), money(total, locale)) }
      : splitType === 'percentage' && percentageTotal < 100
        ? { type: 'warning', message: t.percentageMissing(100 - percentageTotal) }
        : splitType === 'amount' && specificAmountTotal < total
          ? { type: 'warning', message: t.amountMissing(money(total - specificAmountTotal, locale), money(total, locale)) }
          : null;
  const updateName = (index, value) => setNames((current) => current.map((name, itemIndex) => itemIndex === index ? value : name));
  const updateDetail = (index, value) => setDetails((current) => Array.from({ length: names.length }, (_, itemIndex) => itemIndex === index ? value : current[itemIndex] || ''));
  const selectSplitType = (type) => {
    setSplitType(type);
    setDetails(names.map(() => type === 'amount' ? '0,00' : ''));
    setIsSplitSelectOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}><Pressable onPress={onBack} accessibilityLabel={t.back} style={styles.backButton}><Text style={styles.backArrow}>‹</Text></Pressable><Text style={styles.headerTitle}>{t.customize}</Text></View>
        <Text style={styles.eyebrow}>{t.billDetails}</Text><Text style={styles.title}>{t.customizeTitle.replace('{line}', '\n')}</Text>
        <View style={[styles.card, styles.detailsCard]}>
          <Text style={styles.fieldLabel}>{t.totalAmount}</Text>
          <View style={styles.amountRow}><Text style={styles.currency}>R$</Text><TextInput accessibilityLabel={t.totalAccessibility} value={amount} onChangeText={(value) => setAmount(formatCents(value, 9))} keyboardType="number-pad" selectTextOnFocus style={styles.amountInput} /></View>
          <View style={styles.divider} />
          <Text style={[styles.fieldLabel, styles.peopleLabel]}>{t.people}</Text>
          <View style={styles.stepper}>
            <Pressable accessibilityLabel={t.removePerson} onPress={() => changePeople(people - 1)} style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}><Text style={styles.stepSymbol}>−</Text></Pressable>
            <View style={styles.peopleCount}><Text style={styles.peopleNumber}>{people}</Text><Text style={styles.peopleWord}>{people === 1 ? t.person : t.peoplePlural}</Text></View>
            <Pressable accessibilityLabel={t.addPerson} onPress={() => changePeople(people + 1)} style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}><Text style={styles.stepSymbol}>+</Text></Pressable>
          </View>
          {splitType === 'equal' && <View style={styles.detailResult}><Text style={styles.resultLabel}>{t.eachPays}</Text><Text style={styles.detailResultValue}>{money(total / people, locale)}</Text></View>}
        </View>
        <Text style={[styles.fieldLabel, styles.sectionLabel]}>{t.splitType}</Text>
        <Pressable onPress={() => setIsSplitSelectOpen(true)} style={styles.selectControl} accessibilityLabel={t.selectSplit}><View><Text style={styles.selectValue}>{selectedSplit[1]}</Text><Text style={styles.selectCaption}>{selectedSplit[2]}</Text></View><Text style={styles.selectChevron}>⌄</Text></Pressable>
        <Text style={[styles.fieldLabel, styles.peopleSectionLabel]}>{t.participants}</Text>
        <View style={styles.participants}>
          {names.map((name, index) => (
            <View key={index} style={styles.participantRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{String(name.trim()[0] || index + 1).toUpperCase()}</Text></View>
              <View style={styles.participantInfo}>
                <TextInput value={name} onChangeText={(value) => updateName(index, value)} placeholder={t.personPlaceholder(index + 1)} placeholderTextColor="#9BA7A2" style={styles.nameInput} />
                {splitType === 'percentage' && <Text style={styles.percentageAmount}>{money((Number.parseInt(details[index], 10) || 0) * total / 100, locale)}</Text>}
              </View>
              {splitType === 'equal' ? <Text style={styles.equalShare}>{money(total / names.length, locale)}</Text> : <View style={styles.detailInputWrap}><TextInput value={details[index] || (splitType === 'amount' ? '0,00' : '')} onChangeText={(value) => updateDetail(index, splitType === 'amount' ? formatCents(value) : value.replace(/\D/g, ''))} placeholder={splitType === 'percentage' ? equalPercentage : '0,00'} keyboardType="number-pad" placeholderTextColor="#7A8983" style={styles.detailInput} /><Text style={styles.detailSuffix}>{splitType === 'percentage' ? '%' : 'R$'}</Text></View>}
            </View>
          ))}
        </View>
        {validation && <View style={validation.type === 'error' ? styles.validationError : styles.validationWarning}><Text style={validation.type === 'error' ? styles.validationErrorIcon : styles.validationWarningIcon}>!</Text><Text style={validation.type === 'error' ? styles.validationErrorText : styles.validationWarningText}>{validation.message}</Text></View>}
        <SplitTypeModal visible={isSplitSelectOpen} onClose={() => setIsSplitSelectOpen(false)} options={splitOptions} selectedType={splitType} onSelect={selectSplitType} title={t.splitTypeTitle} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F3' }, content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 }, header: { height: 72, flexDirection: 'row', alignItems: 'center' }, backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E9EEEA', alignItems: 'center', justifyContent: 'center', marginRight: 12 }, backArrow: { color: '#1E3D35', fontSize: 34, fontWeight: '300', lineHeight: 32, marginTop: -3 }, headerTitle: { color: '#1E3D35', fontSize: 17, fontWeight: '800', letterSpacing: -0.4 }, eyebrow: { color: '#6C817A', fontSize: 11, fontWeight: '800', letterSpacing: 1.4 }, title: { color: '#1E3D35', fontSize: 31, lineHeight: 36, fontWeight: '800', letterSpacing: -1.2, marginTop: 9, marginBottom: 28 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#1E3D35', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 2 }, detailsCard: { marginBottom: 28 }, fieldLabel: { color: '#75847F', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }, amountRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 10 }, currency: { color: '#1E3D35', fontSize: 22, fontWeight: '700', marginRight: 8 }, amountInput: { color: '#1E3D35', flex: 1, fontSize: 32, lineHeight: 40, fontWeight: '800', padding: 0, letterSpacing: -1 }, divider: { height: 1, backgroundColor: '#E8ECE9', marginTop: 22 }, peopleLabel: { marginTop: 22 }, stepper: { height: 62, backgroundColor: '#F3F5F1', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 11, paddingHorizontal: 7 }, stepButton: { width: 48, height: 48, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, pressed: { opacity: 0.55 }, stepSymbol: { color: '#1E3D35', fontSize: 27, lineHeight: 30, fontWeight: '500' }, peopleCount: { alignItems: 'center' }, peopleNumber: { color: '#1E3D35', fontSize: 21, fontWeight: '800', lineHeight: 24 }, peopleWord: { color: '#75847F', fontSize: 11, marginTop: 1 }, detailResult: { alignItems: 'center', paddingTop: 24 }, resultLabel: { color: '#75847F', fontSize: 11, letterSpacing: 1.2, fontWeight: '800' }, detailResultValue: { color: '#1E3D35', fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -1.2, marginTop: 3 },
  sectionLabel: { marginBottom: 11 }, selectControl: { minHeight: 68, borderWidth: 1, borderColor: '#DDE4DE', borderRadius: 16, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF' }, selectValue: { color: '#1E3D35', fontSize: 15, fontWeight: '800' }, selectCaption: { color: '#71807A', fontSize: 12, marginTop: 3 }, selectChevron: { color: '#1E3D35', fontSize: 27, lineHeight: 25, marginBottom: 7 }, peopleSectionLabel: { marginTop: 28, marginBottom: 11 }, participants: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 16 }, participantRow: { minHeight: 69, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EDF0ED' }, avatar: { height: 35, width: 35, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DDE9D8', marginRight: 11 }, avatarText: { color: '#31564B', fontSize: 14, fontWeight: '800' }, participantInfo: { flex: 1, paddingVertical: 8 }, nameInput: { color: '#1E3D35', fontSize: 15, fontWeight: '600', paddingVertical: 2 }, percentageAmount: { color: '#71807A', fontSize: 12, fontWeight: '600', marginTop: 2 }, equalShare: { color: '#1E3D35', fontSize: 13, fontWeight: '800' }, detailInputWrap: { height: 37, width: 78, borderRadius: 10, backgroundColor: '#F1F4F0', flexDirection: 'row', alignItems: 'center', paddingLeft: 8 }, detailInput: { color: '#1E3D35', fontSize: 13, fontWeight: '700', flex: 1, padding: 0 }, detailSuffix: { color: '#71807A', fontSize: 11, fontWeight: '800', paddingHorizontal: 7 },
  validationError: { marginTop: 13, borderRadius: 13, backgroundColor: '#FDE8E4', paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'flex-start' }, validationErrorIcon: { color: '#A83E32', fontSize: 14, fontWeight: '900', marginRight: 8, marginTop: 1 }, validationErrorText: { color: '#8C352C', fontSize: 13, lineHeight: 18, fontWeight: '600', flex: 1 }, validationWarning: { marginTop: 13, borderRadius: 13, backgroundColor: '#FFF4CF', paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'flex-start' }, validationWarningIcon: { color: '#8A6500', fontSize: 14, fontWeight: '900', marginRight: 8, marginTop: 1 }, validationWarningText: { color: '#715300', fontSize: 13, lineHeight: 18, fontWeight: '600', flex: 1 },
});
