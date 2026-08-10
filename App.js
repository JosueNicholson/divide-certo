import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';
import AuthScreen from './src/screens/AuthScreen';
import GroupsScreen from './src/screens/GroupsScreen';
import GroupDetailScreen from './src/screens/GroupDetailScreen';
import CreateBillScreen from './src/screens/CreateBillScreen';
import { getSystemLanguage, getLocale, translations } from './src/i18n';
import HomeScreen from './src/screens/HomeScreen';
import CustomizeScreen from './src/screens/CustomizeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { isSupabaseConfigured, supabase } from './src/services/supabase';
import { acceptGroupInvite } from './src/services/groups';
import { parseBrazilianNumber } from './src/utils/formatters';

const LANGUAGE_STORAGE_KEY = '@divide-certo:language';

export default function App() {
  const [amount, setAmount] = useState('186,40');
  const [people, setPeople] = useState(3);
  const [screen, setScreen] = useState('groups');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [names, setNames] = useState(['Ana', 'Bruno', 'Carla']);
  const [splitType, setSplitType] = useState('equal');
  const [language, setLanguage] = useState(getSystemLanguage);
  const [session, setSession] = useState(null);
  const [pendingInviteId, setPendingInviteId] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(isSupabaseConfigured);
  const t = translations[language];
  const locale = getLocale(language);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((savedLanguage) => {
      if (translations[savedLanguage]) setLanguage(savedLanguage);
    });
  }, []);

  useEffect(() => {
    const setInviteFromUrl = (url) => {
      const inviteId = Linking.parse(url).queryParams?.inviteId;
      if (typeof inviteId === 'string') setPendingInviteId(inviteId);
    };

    Linking.getInitialURL().then((url) => {
      if (url) setInviteFromUrl(url);
    });
    const subscription = Linking.addEventListener('url', ({ url }) => setInviteFromUrl(url));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!session || !pendingInviteId) return;

    acceptGroupInvite(pendingInviteId)
      .then(() => {
        setPendingInviteId(null);
        setScreen('groups');
        Alert.alert(t.inviteAcceptedTitle, t.inviteAccepted);
      })
      .catch(() => {
        setPendingInviteId(null);
        Alert.alert(t.inviteAcceptErrorTitle, t.inviteAcceptError);
      });
  }, [
    pendingInviteId,
    session,
    t.inviteAcceptError,
    t.inviteAcceptErrorTitle,
    t.inviteAccepted,
    t.inviteAcceptedTitle,
  ]);

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
  } else if ((screen === 'createBill' || screen === 'editBill') && selectedGroupId) {
    content = (
      <CreateBillScreen
        billId={screen === 'editBill' ? selectedBillId : null}
        groupId={selectedGroupId}
        members={groupMembers}
        onBack={() => setScreen('groupDetail')}
        onCreated={() => setScreen('groupDetail')}
        locale={locale}
        t={t}
      />
    );
  } else if (screen === 'groupDetail' && selectedGroupId) {
    content = (
      <GroupDetailScreen
        groupId={selectedGroupId}
        language={language}
        onBack={() => setScreen('groups')}
        onCreateBill={(members) => {
          setGroupMembers(members);
          setScreen('createBill');
        }}
        onEditBill={(billId, members) => {
          setSelectedBillId(billId);
          setGroupMembers(members);
          setScreen('editBill');
        }}
        t={t}
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
        hasPendingInvite={Boolean(pendingInviteId)}
        t={t}
        onOpenSettings={() => setScreen('settings')}
      />
    );
  } else if (screen === 'groups') {
    content = (
      <GroupsScreen
        t={t}
        onOpenGroup={(groupId) => {
          setSelectedGroupId(groupId);
          setScreen('groupDetail');
        }}
        onOpenSettings={() => setScreen('settings')}
      />
    );
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
