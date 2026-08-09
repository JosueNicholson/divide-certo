import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';
import AuthScreen from './src/screens/AuthScreen';
import GroupsScreen from './src/screens/GroupsScreen';
import { getSystemLanguage, getLocale, translations } from './src/i18n';
import HomeScreen from './src/screens/HomeScreen';
import CustomizeScreen from './src/screens/CustomizeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { isSupabaseConfigured, supabase } from './src/services/supabase';
import { parseBrazilianNumber } from './src/utils/formatters';

const LANGUAGE_STORAGE_KEY = '@divide-certo:language';

export default function App() {
  const [amount, setAmount] = useState('186,40');
  const [people, setPeople] = useState(3);
  const [screen, setScreen] = useState('groups');
  const [names, setNames] = useState(['Ana', 'Bruno', 'Carla']);
  const [splitType, setSplitType] = useState('equal');
  const [language, setLanguage] = useState(getSystemLanguage);
  const [session, setSession] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(isSupabaseConfigured);
  const t = translations[language];
  const locale = getLocale(language);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((savedLanguage) => {
      if (translations[savedLanguage]) setLanguage(savedLanguage);
    });
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setIsSessionLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setIsSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  const total = useMemo(() => parseBrazilianNumber(amount), [amount]);

  const changePeople = (nextPeople) => {
    const safePeople = Math.max(1, nextPeople);
    setPeople(safePeople);
    setNames((currentNames) =>
      Array.from(
        { length: safePeople },
        (_, index) => currentNames[index] || t.personPlaceholder(index + 1),
      ),
    );
  };

  let content;

  if (screen === 'customize') {
    content = (
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
        onBack={() => setScreen('groups')}
      />
    );
  } else if (screen === 'settings') {
    content = (
      <SettingsScreen
        language={language}
        setLanguage={changeLanguage}
        t={t}
        onBack={() => setScreen(session ? 'groups' : 'auth')}
      />
    );
  } else if (!session) {
    content = (
      <AuthScreen
        isLoading={isSessionLoading}
        isSupabaseConfigured={isSupabaseConfigured}
        t={t}
        onOpenSettings={() => setScreen('settings')}
      />
    );
  } else if (screen === 'groups') {
    content = <GroupsScreen t={t} onOpenSettings={() => setScreen('settings')} />;
  } else {
    content = (
      <HomeScreen
        t={t}
        onStart={() => setScreen('customize')}
        onOpenSettings={() => setScreen('settings')}
      />
    );
  }

  return <SafeAreaProvider>{content}</SafeAreaProvider>;
}
