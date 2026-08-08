import { StatusBar } from 'expo-status-bar';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
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

const LANGUAGE_STORAGE_KEY = '@divide-certo:language';
const languages = [
  { code: 'pt', locale: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'en', locale: 'en-US', label: 'English' },
  { code: 'es', locale: 'es-ES', label: 'Español' },
  { code: 'fr', locale: 'fr-FR', label: 'Français' },
];

const translations = {
  pt: {
    homeTitle: 'Dividir as contas{line}nunca foi tão fácil', start: 'Fazer divisão de conta', settings: 'Configurações',
    customize: 'Personalizar divisão', billDetails: 'DETALHES DA CONTA', customizeTitle: 'Vamos acertar{line}essa conta.', totalAmount: 'VALOR TOTAL', people: 'PESSOAS', person: 'pessoa', peoplePlural: 'pessoas', eachPays: 'CADA PESSOA PAGA', splitType: 'TIPO DE DIVISÃO', participants: 'QUEM PARTICIPA',
    equal: 'Divisão igual', equalCaption: 'Mesma parte para cada pessoa', percentage: 'Divisão percentual', percentageCaption: 'Defina a porcentagem de cada pessoa', amount: 'Valores específicos', amountCaption: 'Defina o valor de cada pessoa', splitTypeTitle: 'Tipo de divisão',
    percentageOver: (value) => `A soma das porcentagens é ${value}%. Ela não pode passar de 100%.`, amountOver: (value, total) => `A soma dos valores (${value}) ultrapassa o total da conta (${total}).`, percentageMissing: (value) => `Faltam ${value}% para completar 100%.`, amountMissing: (value, total) => `Faltam ${value} para completar o valor total de ${total}.`, personPlaceholder: (index) => `Pessoa ${index}`, back: 'Voltar', totalAccessibility: 'Valor total da conta', removePerson: 'Remover pessoa', addPerson: 'Adicionar pessoa', selectSplit: 'Selecionar tipo de divisão', language: 'Idioma', languageDescription: 'Escolha o idioma do aplicativo', appSettings: 'Configurações', languageSystem: 'O idioma inicial segue o sistema operacional.',
  },
  en: {
    homeTitle: 'Splitting bills{line}has never been easier', start: 'Split a bill', settings: 'Settings',
    customize: 'Customize split', billDetails: 'BILL DETAILS', customizeTitle: "Let's settle{line}this bill.", totalAmount: 'TOTAL AMOUNT', people: 'PEOPLE', person: 'person', peoplePlural: 'people', eachPays: 'EACH PERSON PAYS', splitType: 'SPLIT TYPE', participants: 'PARTICIPANTS',
    equal: 'Equal split', equalCaption: 'The same share for each person', percentage: 'Percentage split', percentageCaption: 'Set each person’s percentage', amount: 'Specific amounts', amountCaption: 'Set each person’s amount', splitTypeTitle: 'Split type',
    percentageOver: (value) => `The percentages add up to ${value}%. They cannot exceed 100%.`, amountOver: (value, total) => `The amounts (${value}) exceed the bill total (${total}).`, percentageMissing: (value) => `${value}% is missing to complete 100%.`, amountMissing: (value, total) => `${value} is missing to complete the total of ${total}.`, personPlaceholder: (index) => `Person ${index}`, back: 'Back', totalAccessibility: 'Bill total amount', removePerson: 'Remove person', addPerson: 'Add person', selectSplit: 'Select split type', language: 'Language', languageDescription: 'Choose the app language', appSettings: 'Settings', languageSystem: 'The initial language follows your operating system.',
  },
  es: {
    homeTitle: 'Dividir las cuentas{line}nunca fue tan fácil', start: 'Dividir una cuenta', settings: 'Configuración',
    customize: 'Personalizar división', billDetails: 'DETALLES DE LA CUENTA', customizeTitle: 'Vamos a resolver{line}esta cuenta.', totalAmount: 'VALOR TOTAL', people: 'PERSONAS', person: 'persona', peoplePlural: 'personas', eachPays: 'CADA PERSONA PAGA', splitType: 'TIPO DE DIVISIÓN', participants: 'QUIÉN PARTICIPA',
    equal: 'División igual', equalCaption: 'La misma parte para cada persona', percentage: 'División porcentual', percentageCaption: 'Define el porcentaje de cada persona', amount: 'Valores específicos', amountCaption: 'Define el valor de cada persona', splitTypeTitle: 'Tipo de división',
    percentageOver: (value) => `La suma de los porcentajes es ${value}%. No puede superar el 100%.`, amountOver: (value, total) => `La suma de los valores (${value}) supera el total de la cuenta (${total}).`, percentageMissing: (value) => `Falta ${value}% para completar el 100%.`, amountMissing: (value, total) => `Faltan ${value} para completar el total de ${total}.`, personPlaceholder: (index) => `Persona ${index}`, back: 'Volver', totalAccessibility: 'Valor total de la cuenta', removePerson: 'Eliminar persona', addPerson: 'Agregar persona', selectSplit: 'Seleccionar tipo de división', language: 'Idioma', languageDescription: 'Elige el idioma de la aplicación', appSettings: 'Configuración', languageSystem: 'El idioma inicial sigue el sistema operativo.',
  },
  fr: {
    homeTitle: 'Partager les additions{line}n’a jamais été aussi simple', start: 'Partager une addition', settings: 'Paramètres',
    customize: 'Personnaliser le partage', billDetails: 'DÉTAILS DE L’ADDITION', customizeTitle: 'Réglons{line}cette addition.', totalAmount: 'MONTANT TOTAL', people: 'PERSONNES', person: 'personne', peoplePlural: 'personnes', eachPays: 'CHAQUE PERSONNE PAIE', splitType: 'TYPE DE PARTAGE', participants: 'PARTICIPANTS',
    equal: 'Partage égal', equalCaption: 'La même part pour chaque personne', percentage: 'Partage en pourcentage', percentageCaption: 'Définissez le pourcentage de chacun', amount: 'Montants spécifiques', amountCaption: 'Définissez le montant de chacun', splitTypeTitle: 'Type de partage',
    percentageOver: (value) => `La somme des pourcentages est de ${value} %. Elle ne peut pas dépasser 100 %.`, amountOver: (value, total) => `La somme des montants (${value}) dépasse le total (${total}).`, percentageMissing: (value) => `Il manque ${value} % pour atteindre 100 %.`, amountMissing: (value, total) => `Il manque ${value} pour atteindre le total de ${total}.`, personPlaceholder: (index) => `Personne ${index}`, back: 'Retour', totalAccessibility: 'Montant total de l’addition', removePerson: 'Retirer une personne', addPerson: 'Ajouter une personne', selectSplit: 'Sélectionner le type de partage', language: 'Langue', languageDescription: 'Choisissez la langue de l’application', appSettings: 'Paramètres', languageSystem: 'La langue initiale suit le système d’exploitation.',
  },
};

const getSystemLanguage = () => {
  const systemLanguage = Localization.getLocales()[0]?.languageCode;
  return languages.some(({ code }) => code === systemLanguage) ? systemLanguage : 'pt';
};

const money = (value, locale = 'pt-BR') =>
  new Intl.NumberFormat(locale, {
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
  const [language, setLanguage] = useState(getSystemLanguage);
  const t = translations[language];
  const locale = languages.find(({ code }) => code === language).locale;

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((savedLanguage) => {
      if (languages.some(({ code }) => code === savedLanguage)) setLanguage(savedLanguage);
    });
  }, []);

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  const total = useMemo(() => {
    const normalized = amount.replace(/\./g, '').replace(',', '.');
    return Number.parseFloat(normalized) || 0;
  }, [amount]);

  const changePeople = (nextPeople) => {
    const safePeople = Math.max(1, nextPeople);
    setPeople(safePeople);
    setNames((currentNames) => Array.from(
      { length: safePeople },
      (_, index) => currentNames[index] || t.personPlaceholder(index + 1),
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
        t={t}
        locale={locale}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'settings') {
    return <SettingsScreen language={language} setLanguage={changeLanguage} t={t} onBack={() => setScreen('home')} />;
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
            <Pressable onPress={() => setScreen('settings')} accessibilityLabel={t.settings} style={styles.settingsButton}>
              <Text style={styles.settingsIcon}>⚙</Text>
            </Pressable>
          </View>

          <View style={styles.intro}>
            <Text style={styles.title}>{t.homeTitle.replace('{line}', '\n')}</Text>
          </View>

          <Pressable
            onPress={() => setScreen('customize')}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}
          >
            <Text style={styles.primaryText}>{t.start}</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CustomizeScreen({ amount, setAmount, total, people, changePeople, names, setNames, splitType, setSplitType, t, locale, onBack }) {
  const [details, setDetails] = useState(() => names.map(() => ''));
  const [isSplitSelectOpen, setIsSplitSelectOpen] = useState(false);
  const equalPercentage = (100 / names.length).toFixed(names.length === 3 ? 2 : 1).replace('.', ',');
  const splitOptions = [
    ['equal', t.equal, t.equalCaption],
    ['percentage', t.percentage, t.percentageCaption],
    ['amount', t.amount, t.amountCaption],
  ];
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
          <Pressable onPress={onBack} accessibilityLabel={t.back} style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <Text style={styles.customHeader}>{t.customize}</Text>
        </View>

        <Text style={styles.eyebrow}>{t.billDetails}</Text>
        <Text style={styles.customTitle}>{t.customizeTitle.replace('{line}', '\n')}</Text>

        <View style={[styles.card, styles.detailsCard]}>
          <Text style={styles.fieldLabel}>{t.totalAmount}</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currency}>R$</Text>
            <TextInput
              accessibilityLabel={t.totalAccessibility}
              value={amount}
              onChangeText={(value) => setAmount(formatCents(value, 9))}
              keyboardType="number-pad"
              selectTextOnFocus
              style={styles.amountInput}
            />
          </View>
          <View style={styles.divider} />

          <Text style={[styles.fieldLabel, styles.peopleLabel]}>{t.people}</Text>
          <View style={styles.stepper}>
            <Pressable accessibilityLabel={t.removePerson} onPress={() => changePeople(people - 1)} style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}><Text style={styles.stepSymbol}>−</Text></Pressable>
            <View style={styles.peopleCount}>
              <Text style={styles.peopleNumber}>{people}</Text>
              <Text style={styles.peopleWord}>{people === 1 ? t.person : t.peoplePlural}</Text>
            </View>
            <Pressable accessibilityLabel={t.addPerson} onPress={() => changePeople(people + 1)} style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}><Text style={styles.stepSymbol}>+</Text></Pressable>
          </View>
          {splitType === 'equal' && (
            <View style={styles.detailResult}>
              <Text style={styles.resultLabel}>{t.eachPays}</Text>
              <Text style={styles.detailResultValue}>{money(total / people, locale)}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.fieldLabel, styles.sectionLabel]}>{t.splitType}</Text>
        <Pressable onPress={() => setIsSplitSelectOpen(true)} style={styles.selectControl} accessibilityLabel={t.selectSplit}>
          <View><Text style={styles.selectValue}>{selectedSplit[1]}</Text><Text style={styles.selectCaption}>{selectedSplit[2]}</Text></View>
          <Text style={styles.selectChevron}>⌄</Text>
        </Pressable>

        <Text style={[styles.fieldLabel, styles.peopleSectionLabel]}>{t.participants}</Text>
        <View style={styles.participants}>
          {names.map((name, index) => (
            <View key={index} style={styles.participantRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{String(name.trim()[0] || index + 1).toUpperCase()}</Text></View>
              <View style={styles.participantInfo}>
                <TextInput value={name} onChangeText={(value) => updateName(index, value)} placeholder={t.personPlaceholder(index + 1)} placeholderTextColor="#9BA7A2" style={styles.nameInput} />
                {splitType === 'percentage' && (
                  <Text style={styles.percentageAmount}>{money((Number.parseInt(details[index], 10) || 0) * total / 100, locale)}</Text>
                )}
              </View>
              {splitType === 'equal' ? <Text style={styles.equalShare}>{money(total / names.length, locale)}</Text> : (
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

        {validation && (
          <View style={validation.type === 'error' ? styles.validationError : styles.validationWarning}>
            <Text style={validation.type === 'error' ? styles.validationErrorIcon : styles.validationWarningIcon}>!</Text>
            <Text style={validation.type === 'error' ? styles.validationErrorText : styles.validationWarningText}>{validation.message}</Text>
          </View>
        )}

        <Modal transparent visible={isSplitSelectOpen} animationType="fade" onRequestClose={() => setIsSplitSelectOpen(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setIsSplitSelectOpen(false)}>
            <Pressable style={styles.selectModal} onPress={() => {}}>
              <Text style={styles.modalTitle}>{t.splitTypeTitle}</Text>
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

function SettingsScreen({ language, setLanguage, t, onBack }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, styles.customContent]}>
        <View style={styles.header}>
          <Pressable onPress={onBack} accessibilityLabel={t.back} style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <Text style={styles.customHeader}>{t.appSettings}</Text>
        </View>

        <Text style={styles.eyebrow}>{t.appSettings.toUpperCase()}</Text>
        <Text style={styles.customTitle}>{t.language}</Text>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsDescription}>{t.languageDescription}</Text>
          {languages.map(({ code, label }) => (
            <Pressable
              key={code}
              accessibilityLabel={label}
              accessibilityState={{ selected: language === code }}
              onPress={() => setLanguage(code)}
              style={styles.languageOption}
            >
              <Text style={styles.languageOptionText}>{label}</Text>
              {language === code && <Text style={styles.selectedCheck}>✓</Text>}
            </Pressable>
          ))}
        </View>
        <Text style={styles.settingsHint}>{t.languageSystem}</Text>
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
  brand: { marginLeft: 9, color: '#1E3D35', fontSize: 18, fontWeight: '700', letterSpacing: -0.5 }, settingsButton: { marginLeft: 'auto', width: 40, height: 40, borderRadius: 20, backgroundColor: '#E9EEEA', alignItems: 'center', justifyContent: 'center' }, settingsIcon: { color: '#1E3D35', fontSize: 19 },
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
  participantInfo: { flex: 1, paddingVertical: 8 }, nameInput: { color: '#1E3D35', fontSize: 15, fontWeight: '600', paddingVertical: 2 }, percentageAmount: { color: '#71807A', fontSize: 12, fontWeight: '600', marginTop: 2 }, equalShare: { color: '#1E3D35', fontSize: 13, fontWeight: '800' },
  detailInputWrap: { height: 37, width: 78, borderRadius: 10, backgroundColor: '#F1F4F0', flexDirection: 'row', alignItems: 'center', paddingLeft: 8 },
  detailInput: { color: '#1E3D35', fontSize: 13, fontWeight: '700', flex: 1, padding: 0 }, detailSuffix: { color: '#71807A', fontSize: 11, fontWeight: '800', paddingHorizontal: 7 },
  validationError: { marginTop: 13, borderRadius: 13, backgroundColor: '#FDE8E4', paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'flex-start' },
  validationErrorIcon: { color: '#A83E32', fontSize: 14, fontWeight: '900', marginRight: 8, marginTop: 1 }, validationErrorText: { color: '#8C352C', fontSize: 13, lineHeight: 18, fontWeight: '600', flex: 1 },
  validationWarning: { marginTop: 13, borderRadius: 13, backgroundColor: '#FFF4CF', paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'flex-start' },
  validationWarningIcon: { color: '#8A6500', fontSize: 14, fontWeight: '900', marginRight: 8, marginTop: 1 }, validationWarningText: { color: '#715300', fontSize: 13, lineHeight: 18, fontWeight: '600', flex: 1 },
  settingsCard: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 18 }, settingsDescription: { color: '#71807A', fontSize: 14, lineHeight: 20, paddingTop: 18, paddingBottom: 9 },
  languageOption: { minHeight: 59, borderTopWidth: 1, borderTopColor: '#EDF0ED', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, languageOptionText: { color: '#1E3D35', fontSize: 16, fontWeight: '700' }, settingsHint: { color: '#71807A', fontSize: 13, lineHeight: 19, marginTop: 14 },
});
