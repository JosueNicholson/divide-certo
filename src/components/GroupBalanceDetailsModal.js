import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { money } from '../utils/currency';

const signedMoney = (amountInCents, locale) => {
  const sign = amountInCents > 0 ? '+' : amountInCents < 0 ? '-' : '';
  return `${sign}${money(Math.abs(amountInCents) / 100, locale)}`;
};

export default function GroupBalanceDetailsModal({
  balance,
  bills,
  locale,
  memberNames,
  onClose,
  t,
  visible,
}) {
  const balanceClassName =
    balance > 0 ? 'text-[#31564B]' : balance < 0 ? 'text-[#A83E32]' : 'text-[#1D5774]';

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible={visible}>
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-brand-background">
          <View className="flex-row items-center justify-between px-6 py-4">
            <View>
              <Text className="text-[11px] font-extrabold tracking-[1.4px] text-[#6C817A]">
                {t.groupBalance}
              </Text>
              <Text className="mt-1 text-2xl font-extrabold tracking-[-0.8px] text-[#1E3D35]">
                {t.groupBalanceDetailsTitle}
              </Text>
            </View>
            <Pressable
              accessibilityLabel={t.close}
              className="h-10 w-10 items-center justify-center rounded-full bg-[#E9EEEA] active:bg-[#D5DED7]"
              onPress={onClose}
            >
              <Text className="text-xl font-bold leading-6 text-[#1E3D35]">×</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerClassName="px-6 pb-8">
            <Text className="text-sm leading-5 text-[#526760]">
              {t.groupBalanceDetailsDescription}
            </Text>
            <View className="mt-5 rounded-2xl bg-white px-5 py-4">
              <Text className="text-[11px] font-extrabold tracking-[1.2px] text-[#6C817A]">
                {t.groupBalance}
              </Text>
              <Text
                className={`mt-2 text-[28px] font-extrabold tracking-[-1px] ${balanceClassName}`}
              >
                {signedMoney(balance, locale)}
              </Text>
            </View>
            <Text className="mt-7 text-[11px] font-extrabold tracking-[1.4px] text-[#6C817A]">
              {t.groupBalanceAccounts}
            </Text>
            {bills.length === 0 ? (
              <Text className="mt-3 text-sm leading-5 text-[#71807A]">
                {t.groupBalanceNoAccounts}
              </Text>
            ) : (
              bills.map((bill) => {
                const impactClassName =
                  bill.userBalance > 0
                    ? 'text-[#31564B]'
                    : bill.userBalance < 0
                      ? 'text-[#A83E32]'
                      : 'text-[#1D5774]';

                return (
                  <View className="mt-3 rounded-2xl bg-white px-4 py-4" key={bill.id}>
                    <Text className="text-base font-extrabold text-[#1E3D35]">{bill.name}</Text>
                    <Text className="mt-1 text-sm text-[#71807A]">
                      {t.groupBalancePaidBy(
                        memberNames[bill.paid_by] ?? t.groupBalanceUnknownPayer,
                      )}
                    </Text>
                    <View className="mt-4 flex-row items-end justify-between">
                      <View>
                        <Text className="text-xs font-bold text-[#6C817A]">
                          {t.groupBalanceYourShare}
                        </Text>
                        <Text className="mt-1 text-base font-extrabold text-[#1E3D35]">
                          {money(bill.userShare / 100, locale)}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-xs font-bold text-[#6C817A]">
                          {t.groupBalanceImpact}
                        </Text>
                        <Text className={`mt-1 text-base font-extrabold ${impactClassName}`}>
                          {signedMoney(bill.userBalance, locale)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}
