import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SplitTypeModal from '../components/SplitTypeModal';
import { createBill } from '../services/groups';
import { formatCents, parseBrazilianNumber } from '../utils/formatters';

export default function CreateBillScreen({ groupId, members, onBack, onCreated, t }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('0,00');
  const [selectedUserIds, setSelectedUserIds] = useState(() =>
    members.map((member) => member.user_id),
  );
  const [splitType, setSplitType] = useState('equal');
  const [isSplitSelectOpen, setIsSplitSelectOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const totalCents = useMemo(() => Math.round(parseBrazilianNumber(amount) * 100), [amount]);
  const splitOptions = [
    ['equal', t.equal, t.equalCaption],
    ['percentage', t.percentage, t.percentageCaption],
    ['amount', t.amount, t.amountCaption],
  ];
  const selectedSplit = splitOptions.find(([type]) => type === splitType);

  const toggleParticipant = (userId) => {
    setSelectedUserIds((currentIds) =>
      currentIds.includes(userId)
        ? currentIds.filter((currentId) => currentId !== userId)
        : [...currentIds, userId],
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert(t.billNameRequiredTitle, t.billNameRequired);
      return;
    }
    if (totalCents < 1) {
      Alert.alert(t.billAmountRequiredTitle, t.billAmountRequired);
      return;
    }
    if (!selectedUserIds.length) {
      Alert.alert(t.billParticipantsRequiredTitle, t.billParticipantsRequired);
      return;
    }

    setIsCreating(true);
    try {
      const bill = await createBill({
        description,
        groupId,
        name,
        splitType,
        totalCents,
        userIds: selectedUserIds,
      });
      onCreated(bill);
    } catch (error) {
      console.error('Failed to create bill:', error);
      Alert.alert(t.billCreateErrorTitle, t.billCreateError);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <StatusBar style="dark" />
      <ScrollView contentContainerClassName="px-6 pb-10" keyboardShouldPersistTaps="handled">
        <View className="h-[72px] flex-row items-center">
          <Pressable
            accessibilityLabel={t.back}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#E9EEEA]"
            disabled={isCreating}
            onPress={onBack}
          >
            <Text className="text-2xl leading-7 text-[#1E3D35]">‹</Text>
          </Pressable>
          <Text className="text-lg font-bold tracking-[-0.5px] text-[#1E3D35]">divide certo</Text>
        </View>
        <Text className="mt-5 text-[11px] font-extrabold tracking-[1.4px] text-[#6C817A]">
          {t.groupBillEyebrow}
        </Text>
        <Text className="mt-2 text-[36px] font-extrabold leading-[40px] tracking-[-1.5px] text-[#1E3D35]">
          {t.createBillTitle}
        </Text>
        <Text className="mt-3 text-base leading-6 text-[#526760]">{t.createBillDescription}</Text>

        <Text className="mb-2 mt-7 text-[11px] font-extrabold tracking-[1.2px] text-[#75847F]">
          {t.billName}
        </Text>
        <TextInput
          accessibilityLabel={t.billName}
          autoFocus
          maxLength={120}
          onChangeText={setName}
          placeholder={t.billNamePlaceholder}
          placeholderTextColor="#7A8983"
          value={name}
          className="h-[58px] rounded-2xl bg-white px-4 text-base font-semibold text-[#1E3D35]"
        />
        <Text className="mb-2 mt-5 text-[11px] font-extrabold tracking-[1.2px] text-[#75847F]">
          {t.billDescription}
        </Text>
        <TextInput
          accessibilityLabel={t.billDescription}
          maxLength={1000}
          multiline
          onChangeText={setDescription}
          placeholder={t.billDescriptionPlaceholder}
          placeholderTextColor="#7A8983"
          value={description}
          className="min-h-[88px] rounded-2xl bg-white px-4 py-4 text-base font-semibold text-[#1E3D35]"
        />
        <Text className="mb-2 mt-5 text-[11px] font-extrabold tracking-[1.2px] text-[#75847F]">
          {t.totalAmount}
        </Text>
        <View className="h-[58px] flex-row items-center rounded-2xl bg-white px-4">
          <Text className="mr-2 text-lg font-bold text-[#1E3D35]">R$</Text>
          <TextInput
            accessibilityLabel={t.totalAccessibility}
            keyboardType="number-pad"
            onChangeText={(value) => setAmount(formatCents(value, 9))}
            selectTextOnFocus
            value={amount}
            className="flex-1 p-0 text-xl font-extrabold text-[#1E3D35]"
          />
        </View>

        <Text className="mb-2 mt-7 text-[11px] font-extrabold tracking-[1.2px] text-[#75847F]">
          {t.participants}
        </Text>
        <Text className="mb-3 text-sm leading-5 text-[#71807A]">
          {t.billParticipantsDescription}
        </Text>
        <View className="overflow-hidden rounded-2xl bg-white">
          {members.map((member) => {
            const isSelected = selectedUserIds.includes(member.user_id);
            return (
              <Pressable
                accessibilityLabel={`${isSelected ? t.removeBillParticipant : t.addBillParticipant}: ${member.profiles.display_name}`}
                className="min-h-[64px] flex-row items-center border-b border-[#EDF0ED] px-4"
                key={member.user_id}
                onPress={() => toggleParticipant(member.user_id)}
              >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-[#DDE9D8]">
                  <Text className="text-sm font-extrabold text-[#31564B]">
                    {member.profiles.display_name.trim().charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text className="ml-3 flex-1 text-base font-bold text-[#1E3D35]">
                  {member.profiles.display_name}
                </Text>
                <View
                  className={
                    isSelected
                      ? 'h-6 w-6 items-center justify-center rounded-full bg-[#1E3D35]'
                      : 'h-6 w-6 rounded-full border-2 border-[#B8C4BE]'
                  }
                >
                  {isSelected && <Text className="text-sm font-black text-[#F3F78D]">✓</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>
        <Text className="mb-2 mt-7 text-[11px] font-extrabold tracking-[1.2px] text-[#75847F]">
          {t.splitType}
        </Text>
        <Pressable
          accessibilityLabel={t.selectSplit}
          className="min-h-[68px] flex-row items-center justify-between rounded-2xl border border-[#DDE4DE] bg-white px-4"
          onPress={() => setIsSplitSelectOpen(true)}
        >
          <View>
            <Text className="text-base font-extrabold text-[#1E3D35]">{selectedSplit[1]}</Text>
            <Text className="mt-1 text-xs text-[#71807A]">{selectedSplit[2]}</Text>
          </View>
          <Text className="text-2xl text-[#1E3D35]">⌄</Text>
        </Pressable>
        <Text className="mt-3 text-sm leading-5 text-[#71807A]">{t.billSplitInitialValues}</Text>
        <Pressable
          accessibilityLabel={t.createBill}
          className="mt-8 h-[58px] items-center justify-center rounded-2xl bg-[#1E3D35] active:bg-[#31564B]"
          disabled={isCreating}
          onPress={handleCreate}
        >
          {isCreating ? (
            <ActivityIndicator color="#F3F78D" />
          ) : (
            <Text className="text-base font-extrabold text-[#F3F78D]">{t.createBill}</Text>
          )}
        </Pressable>
        <SplitTypeModal
          onClose={() => setIsSplitSelectOpen(false)}
          onSelect={(type) => {
            setSplitType(type);
            setIsSplitSelectOpen(false);
          }}
          options={splitOptions}
          selectedType={splitType}
          title={t.splitTypeTitle}
          visible={isSplitSelectOpen}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
