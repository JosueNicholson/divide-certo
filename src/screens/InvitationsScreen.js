import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  acceptGroupInvite,
  acceptGroupInviteLink,
  declineGroupInvite,
  getGroupInvitationPreview,
  getPendingGroupInvitations,
} from '../services/groups';

export default function InvitationsScreen({ invite, locale, onBack, onFinished, t }) {
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInvitations = useCallback(async () => {
    setIsLoading(true);
    try {
      if (invite) {
        const preview = await getGroupInvitationPreview(invite);
        setInvitations(preview ? [{ ...preview, ...invite }] : []);
      } else {
        const pending = await getPendingGroupInvitations();
        setInvitations(
          pending.map((pendingInvite) => ({
            expires_at: pendingInvite.expires_at,
            group_id: pendingInvite.group_id,
            group_name: pendingInvite.group_name,
            id: pendingInvite.id,
            inviteId: pendingInvite.id,
            type: 'email',
          })),
        );
      }
    } catch (error) {
      console.error('Failed to load group invitations:', error);
      Alert.alert(t.inviteLoadErrorTitle, t.inviteLoadError);
    } finally {
      setIsLoading(false);
    }
  }, [invite, t.inviteLoadError, t.inviteLoadErrorTitle]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  const finish = () => {
    onFinished();
    onBack();
  };

  const handleAccept = async (currentInvite) => {
    setIsSubmitting(true);
    try {
      if (currentInvite.type === 'link') await acceptGroupInviteLink(currentInvite.token);
      else await acceptGroupInvite(currentInvite.inviteId ?? currentInvite.id);
      Alert.alert(t.inviteAcceptedTitle, t.inviteAccepted, [{ text: t.close, onPress: finish }]);
    } catch (error) {
      console.error('Failed to accept group invitation:', error);
      Alert.alert(t.inviteAcceptErrorTitle, t.inviteAcceptError);
      await loadInvitations();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async (currentInvite) => {
    if (currentInvite.type === 'link') {
      finish();
      return;
    }

    setIsSubmitting(true);
    try {
      await declineGroupInvite(currentInvite.inviteId ?? currentInvite.id);
      setInvitations((currentInvitations) =>
        currentInvitations.filter((item) => item.id !== currentInvite.id),
      );
      onFinished();
      if (invite) onBack();
    } catch (error) {
      console.error('Failed to decline group invitation:', error);
      Alert.alert(t.inviteDeclineErrorTitle, t.inviteDeclineError);
    } finally {
      setIsSubmitting(false);
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
      <View className="flex-1 px-6 pt-5">
        <Text className="text-[11px] font-extrabold tracking-[1.4px] text-[#6C817A]">
          {t.invitationsEyebrow}
        </Text>
        <Text className="mt-2 text-[38px] font-extrabold leading-[42px] tracking-[-1.5px] text-[#1E3D35]">
          {t.invitationsTitle}
        </Text>
        <Text className="mt-4 text-base leading-6 text-[#526760]">{t.invitationsDescription}</Text>
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#1E3D35" />
          </View>
        ) : invitations.length === 0 ? (
          <View className="mt-8 rounded-3xl bg-white px-6 py-7">
            <Text className="text-lg font-extrabold text-[#1E3D35]">{t.invitationsEmptyTitle}</Text>
            <Text className="mt-2 text-sm leading-5 text-[#71807A]">
              {t.invitationsEmptyDescription}
            </Text>
          </View>
        ) : (
          invitations.map((currentInvite) => (
            <View className="mt-8 rounded-3xl bg-white px-6 py-6" key={currentInvite.id}>
              <Text className="text-[11px] font-extrabold tracking-[1.2px] text-[#6C817A]">
                {t.groupEyebrow}
              </Text>
              <Text className="mt-2 text-2xl font-extrabold text-[#1E3D35]">
                {currentInvite.group_name}
              </Text>
              <Text className="mt-3 text-sm leading-5 text-[#71807A]">
                {t.inviteExpiresAt(
                  new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
                    new Date(currentInvite.expires_at),
                  ),
                )}
              </Text>
              <Pressable
                accessibilityLabel={t.acceptInvite}
                className="mt-6 h-[54px] items-center justify-center rounded-2xl bg-[#1E3D35] active:bg-[#31564B]"
                disabled={isSubmitting}
                onPress={() => handleAccept(currentInvite)}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#F3F78D" />
                ) : (
                  <Text className="text-base font-extrabold text-[#F3F78D]">{t.acceptInvite}</Text>
                )}
              </Pressable>
              <Pressable
                accessibilityLabel={t.declineInvite}
                className="mt-3 h-[48px] items-center justify-center rounded-2xl bg-[#FDE8E4] active:opacity-80"
                disabled={isSubmitting}
                onPress={() => handleDecline(currentInvite)}
              >
                <Text className="text-base font-extrabold text-[#A83E32]">{t.declineInvite}</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </SafeAreaView>
  );
}
