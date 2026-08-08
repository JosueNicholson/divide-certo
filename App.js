import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const money = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value || 0);

const formatCents = (value, maxDigits) => {
  const digits = (value.replace(/\D/g, '').replace(/^0+(?=\d)/, '') || '0').slice(0, maxDigits);
  const padded = digits.padStart(3, '0');
  return `${padded.slice(0, -2)},${padded.slice(-2)}`;
};

const parseBrazilianNumber = (value) => Number.parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;

export default function App() {
  const [amount, setAmount] = useState('186,40');
  const [people, setPeople] = useState(3);
  const [screen, setScreen] = useState('home');
  const [names, setNames] = useState(['Ana', 'Bruno', 'Carla']);
  const [splitType, setSplitType] = useState('equal');

  const total = useMemo(() => {
    const normalized = amount.replace(/\./g, '').replace(',', '.');
    return Number.parseFloat(normalized) || 0;
  }, [amount]);

  const changePeople = (nextPeople) => {
    const safePeople = Math.max(1, nextPeople);
    setPeople(safePeople);
    setNames((currentNames) => Array.from(
      { length: safePeople },
      (_, index) => currentNames[index] || `Pessoa ${index + 1}`,
    ));
  };

  if (screen === 'customize') {
    return (
      <CustomizeScreen
        amount={amount}
        setAmount={setAmount}
        total={total}
        people={people}
        changePeople={changePeople}
        names={names}
        setNames={setNames}
        splitType={splitType}
        setSplitType={setSplitType}
        onBack={() => setScreen('home')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logo}><Text style={styles.logoMark}>÷</Text></View>
            <Text style={styles.brand}>divide certo</Text>
          </View>

          <View style={styles.intro}>
            <Text style={styles.title}>Dividir as contas{`\n`}nunca foi tão fácil</Text>
          </View>

          <Pressable
            onPress={() => setScreen('customize')}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}
          >
            <Text style={styles.primaryText}>Fazer divisão de conta</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CustomizeScreen({ amount, setAmount, total, people, changePeople, names, setNames, splitType, setSplitType, onBack }) {
  const [details, setDetails] = useState(() => names.map(() => ''));
  const [isSplitSelectOpen, setIsSplitSelectOpen] = useState(false);
  const equalPercentage = (100 / names.length).toFixed(names.length === 3 ? 2 : 1).replace('.', ',');
  const splitOptions = [
    ['equal', 'Divisão igual', 'Mesma parte para cada pessoa'],
    ['percentage', 'Divisão percentual', 'Defina a porcentagem de cada pessoa'],
    ['amount', 'Valores específicos', 'Defina o valor de cada pessoa'],
  ];
  const selectedSplit = splitOptions.find(([type]) => type === splitType);
  const percentageTotal = details.reduce((sum, detail) => sum + (Number.parseInt(detail, 10) || 0), 0);
  const specificAmountTotal = details.reduce((sum, detail) => sum + parseBrazilianNumber(detail), 0);
  const validationMessage = splitType === 'percentage' && percentageTotal > 100
    ? `A soma das porcentagens é ${percentageTotal}%. Ela não pode passar de 100%.`
    : splitType === 'amount' && specificAmountTotal > total
      ? `A soma dos valores (${money(specificAmountTotal)}) ultrapassa o total da conta (${money(total)}).`
      : null;
  const updateName = (index, value) => setNames((current) => current.map((name, i) => i === index ? value : name));
  const updateDetail = (index, value) => setDetails((current) => Array.from(
    { length: names.length },
    (_, i) => i === index ? value : current[i] || '',
  ));
  const selectSplitType = (type) => {
    setSplitType(type);
    setDetails(names.map(() => type === 'amount' ? '0,00' : ''));
    setIsSplitSelectOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, styles.customContent]} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={onBack} accessibilityLabel="Voltar" style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <Text style={styles.customHeader}>Personalizar divisão</Text>
        </View>

        <Text style={styles.eyebrow}>DETALHES DA CONTA</Text>
        <Text style={styles.customTitle}>Vamos acertar{`\n`}essa conta.</Text>

        <View style={[styles.card, styles.detailsCard]}>
          <Text style={styles.fieldLabel}>VALOR TOTAL</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currency}>R$</Text>
            <TextInput
              accessibilityLabel="Valor total da conta"
              value={amount}
              onChangeText={(value) => setAmount(formatCents(value, 9))}
              keyboardType="number-pad"
              selectTextOnFocus
              style={styles.amountInput}
            />
          </View>
          <View style={styles.divider} />

          <Text style={[styles.fieldLabel, styles.peopleLabel]}>PESSOAS</Text>
          <View style={styles.stepper}>
            <Pressable accessibilityLabel="Remover pessoa" onPress={() => changePeople(people - 1)} style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}><Text style={styles.stepSymbol}>−</Text></Pressable>
            <View style={styles.peopleCount}>
              <Text style={styles.peopleNumber}>{people}</Text>
              <Text style={styles.peopleWord}>{people === 1 ? 'pessoa' : 'pessoas'}</Text>
            </View>
            <Pressable accessibilityLabel="Adicionar pessoa" onPress={() => changePeople(people + 1)} style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}><Text style={styles.stepSymbol}>+</Text></Pressable>
          </View>
          {splitType === 'equal' && (
            <View style={styles.detailResult}>
              <Text style={styles.resultLabel}>CADA PESSOA PAGA</Text>
              <Text style={styles.detailResultValue}>{money(total / people)}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.fieldLabel, styles.sectionLabel]}>TIPO DE DIVISÃO</Text>
        <Pressable onPress={() => setIsSplitSelectOpen(true)} style={styles.selectControl} accessibilityLabel="Selecionar tipo de divisão">
          <View><Text style={styles.selectValue}>{selectedSplit[1]}</Text><Text style={styles.selectCaption}>{selectedSplit[2]}</Text></View>
          <Text style={styles.selectChevron}>⌄</Text>
        </Pressable>

        <Text style={[styles.fieldLabel, styles.peopleSectionLabel]}>QUEM PARTICIPA</Text>
        <View style={styles.participants}>
          {names.map((name, index) => (
            <View key={index} style={styles.participantRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{String(name.trim()[0] || index + 1).toUpperCase()}</Text></View>
              <TextInput value={name} onChangeText={(value) => updateName(index, value)} placeholder={`Pessoa ${index + 1}`} placeholderTextColor="#9BA7A2" style={styles.nameInput} />
              {splitType === 'equal' ? <Text style={styles.equalShare}>{money(total / names.length)}</Text> : (
                <View style={styles.detailInputWrap}>
                  <TextInput
                    value={details[index] || (splitType === 'amount' ? '0,00' : '')}
                    onChangeText={(value) => updateDetail(index, splitType === 'amount' ? formatCents(value) : value.replace(/\D/g, ''))}
                    placeholder={splitType === 'percentage' ? equalPercentage : '0,00'}
                    keyboardType="number-pad"
                    placeholderTextColor="#7A8983"
                    style={styles.detailInput}
                  />
                  <Text style={styles.detailSuffix}>{splitType === 'percentage' ? '%' : 'R$'}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {validationMessage && (
          <View style={styles.validationError}>
            <Text style={styles.validationErrorIcon}>!</Text>
            <Text style={styles.validationErrorText}>{validationMessage}</Text>
          </View>
        )}

        <Modal transparent visible={isSplitSelectOpen} animationType="fade" onRequestClose={() => setIsSplitSelectOpen(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setIsSplitSelectOpen(false)}>
            <Pressable style={styles.selectModal} onPress={() => {}}>
              <Text style={styles.modalTitle}>Tipo de divisão</Text>
              {splitOptions.map(([type, label, caption]) => (
                <Pressable key={type} onPress={() => selectSplitType(type)} style={styles.selectOption}>
                  <View><Text style={styles.selectOptionTitle}>{label}</Text><Text style={styles.selectOptionCaption}>{caption}</Text></View>
                  {splitType === type && <Text style={styles.selectedCheck}>✓</Text>}
                </Pressable>
              ))}
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F3' }, flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 28 },
  header: { height: 72, flexDirection: 'row', alignItems: 'center' },
  logo: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E3D35', alignItems: 'center', justifyContent: 'center' },
  logoMark: { color: '#E9F06B', fontSize: 25, fontWeight: '700', marginTop: -2 },
  brand: { marginLeft: 9, color: '#1E3D35', fontSize: 18, fontWeight: '700', letterSpacing: -0.5 },
  intro: { marginTop: 30, marginBottom: 30 }, eyebrow: { color: '#6C817A', fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: '#1E3D35', fontSize: 42, lineHeight: 45, fontWeight: '800', letterSpacing: -1.8, marginTop: 10 },
  subtitle: { color: '#64736D', fontSize: 16, lineHeight: 23, marginTop: 14, maxWidth: 310 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#1E3D35', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 2 },
  detailsCard: { marginBottom: 28 },
  fieldLabel: { color: '#75847F', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 10 }, currency: { color: '#1E3D35', fontSize: 22, fontWeight: '700', marginRight: 8 },
  amountInput: { color: '#1E3D35', flex: 1, fontSize: 32, lineHeight: 40, fontWeight: '800', padding: 0, letterSpacing: -1 },
  divider: { height: 1, backgroundColor: '#E8ECE9', marginTop: 22 }, peopleLabel: { marginTop: 22 },
  stepper: { height: 62, backgroundColor: '#F3F5F1', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 11, paddingHorizontal: 7 },
  stepButton: { width: 48, height: 48, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, pressed: { opacity: 0.55 },
  stepSymbol: { color: '#1E3D35', fontSize: 27, lineHeight: 30, fontWeight: '500' }, peopleCount: { alignItems: 'center' },
  peopleNumber: { color: '#1E3D35', fontSize: 21, fontWeight: '800', lineHeight: 24 }, peopleWord: { color: '#75847F', fontSize: 11, marginTop: 1 },
  result: { alignItems: 'center', paddingVertical: 31 }, resultLabel: { color: '#75847F', fontSize: 11, letterSpacing: 1.2, fontWeight: '800' },
  resultValue: { color: '#1E3D35', fontSize: 40, lineHeight: 48, fontWeight: '800', letterSpacing: -1.8, marginTop: 6 }, resultHint: { color: '#71807A', fontSize: 14, marginTop: 4 },
  detailResult: { alignItems: 'center', paddingTop: 24 }, detailResultValue: { color: '#1E3D35', fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -1.2, marginTop: 3 },
  primaryButton: { height: 60, backgroundColor: '#1E3D35', borderRadius: 18, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, primaryPressed: { backgroundColor: '#31564B' },
  primaryText: { color: '#F3F78D', fontSize: 16, fontWeight: '800' }, arrow: { color: '#F3F78D', fontSize: 25, fontWeight: '400' },
  customContent: { paddingBottom: 32 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E9EEEA', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  backArrow: { color: '#1E3D35', fontSize: 34, fontWeight: '300', lineHeight: 32, marginTop: -3 },
  customHeader: { color: '#1E3D35', fontSize: 17, fontWeight: '800', letterSpacing: -0.4 },
  customTitle: { color: '#1E3D35', fontSize: 31, lineHeight: 36, fontWeight: '800', letterSpacing: -1.2, marginTop: 9, marginBottom: 28 },
  sectionLabel: { marginBottom: 11 },
  selectControl: { minHeight: 68, borderWidth: 1, borderColor: '#DDE4DE', borderRadius: 16, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF' },
  selectValue: { color: '#1E3D35', fontSize: 15, fontWeight: '800' }, selectCaption: { color: '#71807A', fontSize: 12, marginTop: 3 }, selectChevron: { color: '#1E3D35', fontSize: 27, lineHeight: 25, marginBottom: 7 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20, 38, 32, 0.35)' },
  selectModal: { backgroundColor: '#F7F7F3', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 38 },
  modalTitle: { color: '#1E3D35', fontSize: 20, fontWeight: '800', letterSpacing: -0.5, marginBottom: 12 },
  selectOption: { minHeight: 67, borderBottomWidth: 1, borderBottomColor: '#E4E9E5', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectOptionTitle: { color: '#1E3D35', fontSize: 15, fontWeight: '800' }, selectOptionCaption: { color: '#71807A', fontSize: 12, marginTop: 3 }, selectedCheck: { color: '#1E3D35', fontSize: 20, fontWeight: '800' },
  peopleSectionLabel: { marginTop: 28, marginBottom: 11 },
  participants: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 16 },
  participantRow: { minHeight: 69, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EDF0ED' },
  avatar: { height: 35, width: 35, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DDE9D8', marginRight: 11 }, avatarText: { color: '#31564B', fontSize: 14, fontWeight: '800' },
  nameInput: { flex: 1, color: '#1E3D35', fontSize: 15, fontWeight: '600', paddingVertical: 12 }, equalShare: { color: '#1E3D35', fontSize: 13, fontWeight: '800' },
  detailInputWrap: { height: 37, width: 78, borderRadius: 10, backgroundColor: '#F1F4F0', flexDirection: 'row', alignItems: 'center', paddingLeft: 8 },
  detailInput: { color: '#1E3D35', fontSize: 13, fontWeight: '700', flex: 1, padding: 0 }, detailSuffix: { color: '#71807A', fontSize: 11, fontWeight: '800', paddingHorizontal: 7 },
  validationError: { marginTop: 13, borderRadius: 13, backgroundColor: '#FDE8E4', paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'flex-start' },
  validationErrorIcon: { color: '#A83E32', fontSize: 14, fontWeight: '900', marginRight: 8, marginTop: 1 }, validationErrorText: { color: '#8C352C', fontSize: 13, lineHeight: 18, fontWeight: '600', flex: 1 },
});
