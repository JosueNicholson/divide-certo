import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import SplitTypeModal from '../components/SplitTypeModal';
import { money } from '../utils/currency';
import { formatCents, parseBrazilianNumber } from '../utils/formatters';

export default function CustomizeScreen({ amount, setAmount, total, people, changePeople, names, setNames, splitType, setSplitType, t, locale, onBack }) {
  const [details, setDetails] = useState(() => names.map(() => ''));
  const [isSplitSelectOpen, setIsSplitSelectOpen] = useState(false);
  const equalPercentage = (100 / names.length).toFixed(names.length === 3 ? 2 : 1).replace('.', ',');
  const splitOptions = [['equal', t.equal, t.equalCaption], ['percentage', t.percentage, t.percentageCaption], ['amount', t.amount, t.amountCaption]];
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
  const updateName = (index, value) => setNames((current) => current.map((name, itemIndex) => itemIndex === index ? value : name));
  const updateDetail = (index, value) => setDetails((current) => Array.from({ length: names.length }, (_, itemIndex) => itemIndex === index ? value : current[itemIndex] || ''));
  const selectSplitType = (type) => {
    setSplitType(type);
    setDetails(names.map(() => type === 'amount' ? '0,00' : ''));
    setIsSplitSelectOpen(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <StatusBar style="dark" />
      <ScrollView contentContainerClassName="flex-grow px-6 pb-8" keyboardShouldPersistTaps="handled">
        <View className="h-[72px] flex-row items-center"><Pressable onPress={onBack} accessibilityLabel={t.back} className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-[#E9EEEA]"><Text className="-mt-[3px] text-[34px] font-light leading-8 text-[#1E3D35]">‹</Text></Pressable><Text className="text-[17px] font-extrabold tracking-[-0.4px] text-[#1E3D35]">{t.customize}</Text></View>
        <Text className="text-[11px] font-extrabold tracking-[1.4px] text-[#6C817A]">{t.billDetails}</Text><Text className="mb-7 mt-[9px] text-[31px] font-extrabold leading-9 tracking-[-1.2px] text-[#1E3D35]">{t.customizeTitle.replace('{line}', '\n')}</Text>
        <View className="mb-7 rounded-3xl bg-white p-6 shadow-lg shadow-[#1E3D35]/10 elevation-2">
          <Text className="text-[11px] font-extrabold tracking-[1.2px] text-[#75847F]">{t.totalAmount}</Text>
          <View className="mt-2.5 flex-row items-baseline"><Text className="mr-2 text-[22px] font-bold text-[#1E3D35]">R$</Text><TextInput accessibilityLabel={t.totalAccessibility} value={amount} onChangeText={(value) => setAmount(formatCents(value, 9))} keyboardType="number-pad" selectTextOnFocus className="flex-1 p-0 text-[32px] font-extrabold leading-10 tracking-[-1px] text-[#1E3D35]" /></View>
          <View className="mt-[22px] h-px bg-[#E8ECE9]" />
          <Text className="mt-[22px] text-[11px] font-extrabold tracking-[1.2px] text-[#75847F]">{t.people}</Text>
          <View className="mt-[11px] h-[62px] flex-row items-center justify-between rounded-2xl bg-[#F3F5F1] px-[7px]">
            <Pressable accessibilityLabel={t.removePerson} onPress={() => changePeople(people - 1)} className={({ pressed }) => `h-12 w-12 items-center justify-center rounded-[13px] bg-white ${pressed ? 'opacity-[0.55]' : ''}`}><Text className="text-[27px] font-medium leading-[30px] text-[#1E3D35]">−</Text></Pressable>
            <View className="items-center"><Text className="text-[21px] font-extrabold leading-6 text-[#1E3D35]">{people}</Text><Text className="mt-px text-[11px] text-[#75847F]">{people === 1 ? t.person : t.peoplePlural}</Text></View>
            <Pressable accessibilityLabel={t.addPerson} onPress={() => changePeople(people + 1)} className={({ pressed }) => `h-12 w-12 items-center justify-center rounded-[13px] bg-white ${pressed ? 'opacity-[0.55]' : ''}`}><Text className="text-[27px] font-medium leading-[30px] text-[#1E3D35]">+</Text></Pressable>
          </View>
          {splitType === 'equal' && <View className="items-center pt-6"><Text className="text-[11px] font-extrabold tracking-[1.2px] text-[#75847F]">{t.eachPays}</Text><Text className="mt-[3px] text-[30px] font-extrabold leading-9 tracking-[-1.2px] text-[#1E3D35]">{money(total / people, locale)}</Text></View>}
        </View>
        <Text className="mb-[11px] text-[11px] font-extrabold tracking-[1.2px] text-[#75847F]">{t.splitType}</Text>
        <Pressable onPress={() => setIsSplitSelectOpen(true)} className="min-h-[68px] flex-row items-center justify-between rounded-2xl border border-[#DDE4DE] bg-white px-[17px]" accessibilityLabel={t.selectSplit}><View><Text className="text-[15px] font-extrabold text-[#1E3D35]">{selectedSplit[1]}</Text><Text className="mt-[3px] text-xs text-[#71807A]">{selectedSplit[2]}</Text></View><Text className="mb-[7px] text-[27px] leading-[25px] text-[#1E3D35]">⌄</Text></Pressable>
        <Text className="mb-[11px] mt-7 text-[11px] font-extrabold tracking-[1.2px] text-[#75847F]">{t.participants}</Text>
        <View className="rounded-[20px] bg-white px-4">
          {names.map((name, index) => (
            <View key={index} className="min-h-[69px] flex-row items-center border-b border-[#EDF0ED]">
              <View className="mr-[11px] h-[35px] w-[35px] items-center justify-center rounded-full bg-[#DDE9D8]"><Text className="text-sm font-extrabold text-[#31564B]">{String(name.trim()[0] || index + 1).toUpperCase()}</Text></View>
              <View className="flex-1 py-2"><TextInput value={name} onChangeText={(value) => updateName(index, value)} placeholder={t.personPlaceholder(index + 1)} placeholderTextColor="#9BA7A2" className="py-0.5 text-[15px] font-semibold text-[#1E3D35]" />{splitType === 'percentage' && <Text className="mt-0.5 text-xs font-semibold text-[#71807A]">{money((Number.parseInt(details[index], 10) || 0) * total / 100, locale)}</Text>}</View>
              {splitType === 'equal' ? <Text className="text-[13px] font-extrabold text-[#1E3D35]">{money(total / names.length, locale)}</Text> : <View className="h-[37px] w-[78px] flex-row items-center rounded-[10px] bg-[#F1F4F0] pl-2"><TextInput value={details[index] || (splitType === 'amount' ? '0,00' : '')} onChangeText={(value) => updateDetail(index, splitType === 'amount' ? formatCents(value) : value.replace(/\D/g, ''))} placeholder={splitType === 'percentage' ? equalPercentage : '0,00'} keyboardType="number-pad" placeholderTextColor="#7A8983" className="flex-1 p-0 text-[13px] font-bold text-[#1E3D35]" /><Text className="px-[7px] text-[11px] font-extrabold text-[#71807A]">{splitType === 'percentage' ? '%' : 'R$'}</Text></View>}
            </View>
          ))}
        </View>
        {validation && <View className={validation.type === 'error' ? 'mt-[13px] flex-row items-start rounded-[13px] bg-[#FDE8E4] px-[14px] py-3' : 'mt-[13px] flex-row items-start rounded-[13px] bg-[#FFF4CF] px-[14px] py-3'}><Text className={validation.type === 'error' ? 'mr-2 mt-px text-sm font-black text-[#A83E32]' : 'mr-2 mt-px text-sm font-black text-[#8A6500]'}>!</Text><Text className={validation.type === 'error' ? 'flex-1 text-[13px] font-semibold leading-[18px] text-[#8C352C]' : 'flex-1 text-[13px] font-semibold leading-[18px] text-[#715300]'}>{validation.message}</Text></View>}
        <SplitTypeModal visible={isSplitSelectOpen} onClose={() => setIsSplitSelectOpen(false)} options={splitOptions} selectedType={splitType} onSelect={selectSplitType} title={t.splitTypeTitle} />
      </ScrollView>
    </SafeAreaView>
  );
}
