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
import { createGroupInvite, getGroupDetails } from '../services/groups';

export default function GroupDetailScreen({ groupId, language, onBack, t }) {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const loadDetails = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        setDetails(await getGroupDetails(groupId));
      } catch {
        Alert.alert(t.groupLoadErrorTitle, t.groupLoadError);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [groupId, t.groupLoadError, t.groupLoadErrorTitle],
  );

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const closeInviteModal = () => {
    if (isCreatingInvite) return;
    Keyboard.dismiss();
    setInviteEmail('');
    setIsInviteOpen(false);
  };

  const handleCreateInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) {
      Alert.alert(t.inviteEmailRequiredTitle, t.inviteEmailRequired);
      return;
    }

    setIsCreatingInvite(true);
    try {
      await createGroupInvite(groupId, email, language);
      Keyboard.dismiss();
      setInviteEmail('');
      setIsInviteOpen(false);
      await loadDetails();
    } catch (error) {
      console.error('Failed to create group invite:', error);
      Alert.alert(t.inviteCreateErrorTitle, t.inviteCreateError);
    } finally {
      setIsCreatingInvite(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <StatusBar style="dark" />
      <View className="h-[72px] flex-row items-center px-6">
        <Pressable
          accessibilityLabel={t.back}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#E9EEEA]"
          onPress={onBack}
        >
          <Text className="text-2xl leading-7 text-[#1E3D35]">‹</Text>
        </Pressable>
        <Text className="ml-3 text-lg font-bold tracking-[-0.5px] text-[#1E3D35]">
          divide certo
        </Text>
      </View>
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1E3D35" />
        </View>
      ) : (
        <FlatList
          contentContainerClassName="px-6 pb-8"
          data={details?.members ?? []}
          keyExtractor={(member) => member.profiles.email}
          ListHeaderComponent={
            <View className="mb-7 mt-5">
              <Text className="text-[11px] font-extrabold tracking-[1.4px] text-[#6C817A]">
                {t.groupEyebrow}
              </Text>
              <Text className="mt-2 text-[38px] font-extrabold leading-[42px] tracking-[-1.5px] text-[#1E3D35]">
                {details?.group.name}
              </Text>
              <Text className="mt-4 text-base leading-6 text-[#526760]">
                {t.groupDetailDescription}
              </Text>
              {details?.isAdmin && (
                <Pressable
                  accessibilityLabel={t.inviteMember}
                  className="mt-6 h-[54px] items-center justify-center rounded-2xl bg-[#1E3D35] active:bg-[#31564B]"
                  onPress={() => setIsInviteOpen(true)}
                >
                  <Text className="text-base font-extrabold text-[#F3F78D]">{t.inviteMember}</Text>
                </Pressable>
              )}
              <Text className="mt-8 text-[11px] font-extrabold tracking-[1.4px] text-[#6C817A]">
                {t.groupMembers}
              </Text>
              {details?.isAdmin && details.invites.length > 0 && (
                <View className="mt-7">
                  <Text className="text-[11px] font-extrabold tracking-[1.4px] text-[#6C817A]">
                    {t.pendingInvites}
                  </Text>
                  {details.invites.map((invite) => (
                    <View className="mt-3 rounded-2xl bg-[#E9EEEA] px-4 py-3" key={invite.id}>
                      <Text className="text-sm font-bold text-[#31564B]">{invite.email}</Text>
                      <Text className="mt-1 text-xs text-[#71807A]">{t.invitationPending}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          }
          refreshControl={
            <RefreshControl
              colors={['#1E3D35']}
              onRefresh={() => loadDetails(true)}
              refreshing={isRefreshing}
              tintColor="#1E3D35"
            />
          }
          renderItem={({ item }) => (
            <View className="mb-3 flex-row items-center rounded-3xl bg-white px-5 py-4 shadow-lg shadow-[#1E3D35]/10 elevation-2">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-[#DDE9D8]">
                <Text className="text-lg font-extrabold text-[#31564B]">
                  {item.profiles.display_name.trim().charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-base font-extrabold text-[#1E3D35]">
                  {item.profiles.display_name}
                </Text>
                <Text className="mt-0.5 text-sm text-[#71807A]">{item.profiles.email}</Text>
              </View>
              {item.role === 'admin' && (
                <Text className="rounded-full bg-[#F3F78D] px-3 py-1 text-xs font-extrabold text-[#31564B]">
                  {t.groupAdmin}
                </Text>
              )}
            </View>
          )}
        />
      )}
      <Modal
        animationType="slide"
        transparent
        visible={isInviteOpen}
        onRequestClose={closeInviteModal}
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
                  {t.inviteMember}
                </Text>
                <Pressable
                  accessibilityLabel={t.close}
                  className="h-10 w-10 items-center justify-center rounded-full bg-[#E9EEEA]"
                  onPress={closeInviteModal}
                >
                  <Text className="text-[25px] leading-7 text-[#1E3D35]">×</Text>
                </Pressable>
              </View>
              <Text className="mt-3 text-sm leading-5 text-[#71807A]">
                {t.inviteMemberDescription}
              </Text>
              <TextInput
                accessibilityLabel={t.inviteEmail}
                autoCapitalize="none"
                autoFocus
                keyboardType="email-address"
                onChangeText={setInviteEmail}
                placeholder={t.inviteEmailPlaceholder}
                placeholderTextColor="#7A8983"
                value={inviteEmail}
                className="mt-6 h-[58px] rounded-2xl bg-[#F1F4F0] px-4 text-base font-semibold text-[#1E3D35]"
              />
              <Pressable
                accessibilityLabel={t.sendInvite}
                className="mt-4 h-[58px] items-center justify-center rounded-2xl bg-[#1E3D35] active:bg-[#31564B]"
                disabled={isCreatingInvite}
                onPress={handleCreateInvite}
              >
                {isCreatingInvite ? (
                  <ActivityIndicator color="#F3F78D" />
                ) : (
                  <Text className="text-base font-extrabold text-[#F3F78D]">{t.sendInvite}</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
