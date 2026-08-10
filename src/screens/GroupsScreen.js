import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createGroup, getGroups } from '../services/groups';

export default function GroupsScreen({ onOpenGroup, onOpenSettings, t }) {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadGroups = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        setGroups(await getGroups());
      } catch {
        Alert.alert(t.groupsLoadErrorTitle, t.groupsLoadError);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [t.groupsLoadError, t.groupsLoadErrorTitle],
  );

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const closeCreateModal = () => {
    if (isCreating) return;
    Keyboard.dismiss();
    setIsCreateOpen(false);
    setGroupName('');
  };

  const handleCreateGroup = async () => {
    const trimmedName = groupName.trim();
    if (!trimmedName) {
      Alert.alert(t.groupNameRequiredTitle, t.groupNameRequired);
      return;
    }

    setIsCreating(true);
    try {
      const group = await createGroup(trimmedName);
      setGroups((currentGroups) => [group, ...currentGroups]);
      Keyboard.dismiss();
      setIsCreateOpen(false);
      setGroupName('');
    } catch (error) {
      console.error('Failed to create group:', error);
      Alert.alert(t.groupCreateErrorTitle, t.groupCreateError);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <StatusBar style="dark" />
      <View className="h-[72px] flex-row items-center px-6">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#1E3D35]">
          <Text className="-mt-0.5 text-[25px] font-bold text-[#E9F06B]">÷</Text>
        </View>
        <Text className="ml-[9px] text-lg font-bold tracking-[-0.5px] text-[#1E3D35]">
          divide certo
        </Text>
        <Pressable
          accessibilityLabel={t.settings}
          className="ml-auto h-10 w-10 items-center justify-center rounded-full bg-[#E9EEEA]"
          onPress={onOpenSettings}
        >
          <Text className="text-[19px] text-[#1E3D35]">⚙</Text>
        </Pressable>
      </View>
      <FlatList
        className="flex-1"
        contentContainerClassName="flex-grow px-6 pb-8"
        data={groups}
        keyExtractor={(group) => group.id}
        ListHeaderComponent={
          <View className="mb-7 mt-5">
            <Text className="text-[11px] font-extrabold tracking-[1.4px] text-[#6C817A]">
              {t.groupsEyebrow}
            </Text>
            <Text className="mt-[9px] text-[38px] font-extrabold leading-[42px] tracking-[-1.5px] text-[#1E3D35]">
              {t.groupsTitle.replace('{line}', '\n')}
            </Text>
            <Pressable
              accessibilityLabel={t.createGroup}
              className="mt-7 h-[60px] flex-row items-center justify-between rounded-[18px] bg-[#1E3D35] px-[22px] active:bg-[#31564B]"
              onPress={() => setIsCreateOpen(true)}
            >
              <Text className="text-base font-extrabold text-[#F3F78D]">{t.createGroup}</Text>
              <Text className="text-[25px] font-normal text-[#F3F78D]">+</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 items-center justify-center pb-24">
              <ActivityIndicator color="#1E3D35" />
            </View>
          ) : (
            <View className="rounded-3xl bg-white px-6 py-7">
              <Text className="text-lg font-extrabold text-[#1E3D35]">{t.groupsEmptyTitle}</Text>
              <Text className="mt-2 text-sm leading-5 text-[#71807A]">
                {t.groupsEmptyDescription}
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            colors={['#1E3D35']}
            onRefresh={() => loadGroups(true)}
            refreshing={isRefreshing}
            tintColor="#1E3D35"
          />
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityLabel={item.name}
            className="mb-3 rounded-3xl bg-white px-5 py-5 shadow-lg shadow-[#1E3D35]/10 elevation-2"
            onPress={() => onOpenGroup(item.id)}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#DDE9D8]">
              <Text className="text-lg font-extrabold text-[#31564B]">
                {item.name.trim().charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="mt-4 text-lg font-extrabold text-[#1E3D35]">{item.name}</Text>
            <Text className="mt-1 text-sm text-[#71807A]">{t.groupBillsSoon}</Text>
          </Pressable>
        )}
      />
      <Modal
        animationType="slide"
        transparent
        visible={isCreateOpen}
        onRequestClose={closeCreateModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 bg-black/35"
        >
          <ScrollView
            contentContainerClassName="flex-grow justify-end px-4 pb-4"
            keyboardShouldPersistTaps="handled"
          >
            <View className="rounded-[28px] bg-white px-6 pb-6 pt-5">
              <View className="flex-row items-center">
                <Text className="flex-1 text-[22px] font-extrabold text-[#1E3D35]">
                  {t.createGroupTitle}
                </Text>
                <Pressable
                  accessibilityLabel={t.close}
                  className="h-10 w-10 items-center justify-center rounded-full bg-[#E9EEEA]"
                  onPress={closeCreateModal}
                >
                  <Text className="text-[25px] leading-7 text-[#1E3D35]">×</Text>
                </Pressable>
              </View>
              <Text className="mt-3 text-sm leading-5 text-[#71807A]">
                {t.createGroupDescription}
              </Text>
              <TextInput
                accessibilityLabel={t.groupName}
                autoFocus
                maxLength={120}
                onChangeText={setGroupName}
                placeholder={t.groupNamePlaceholder}
                placeholderTextColor="#7A8983"
                value={groupName}
                className="mt-6 h-[58px] rounded-2xl bg-[#F1F4F0] px-4 text-base font-semibold text-[#1E3D35]"
              />
              <Pressable
                accessibilityLabel={t.createGroup}
                className="mt-4 h-[58px] items-center justify-center rounded-2xl bg-[#1E3D35] active:bg-[#31564B]"
                disabled={isCreating}
                onPress={handleCreateGroup}
              >
                {isCreating ? (
                  <ActivityIndicator color="#F3F78D" />
                ) : (
                  <Text className="text-base font-extrabold text-[#F3F78D]">{t.createGroup}</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
