import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import './global.css';
import { getSystemLanguage, getLocale, translations } from './src/i18n';
import HomeScreen from './src/screens/HomeScreen';
import CustomizeScreen from './src/screens/CustomizeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { parseBrazilianNumber } from './src/utils/formatters';

const LANGUAGE_STORAGE_KEY = '@divide-certo:language';

export default function App() {
  const [amount, setAmount] = useState('186,40');
  const [people, setPeople] = useState(3);
  const [screen, setScreen] = useState('home');
  const [names, setNames] = useState(['Ana', 'Bruno', 'Carla']);
  const [splitType, setSplitType] = useState('equal');
  const [language, setLanguage] = useState(getSystemLanguage);
  const t = translations[language];
  const locale = getLocale(language);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((savedLanguage) => {
      if (translations[savedLanguage]) setLanguage(savedLanguage);
    });
  }, []);

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  const total = useMemo(() => parseBrazilianNumber(amount), [amount]);

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

  return <HomeScreen t={t} onStart={() => setScreen('customize')} onOpenSettings={() => setScreen('settings')} />;
}
