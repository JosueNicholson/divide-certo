import { Modal, Pressable, Text, View } from 'react-native';

export default function SplitTypeModal({ visible, onClose, options, selectedType, onSelect, title }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-[#142620]/35" onPress={onClose}>
        <Pressable className="rounded-t-[28px] bg-brand-background p-6 pb-[38px]" onPress={() => {}}>
          <Text className="mb-3 text-xl font-extrabold tracking-[-0.5px] text-[#1E3D35]">{title}</Text>
          {options.map(([type, label, caption]) => (
            <Pressable key={type} onPress={() => onSelect(type)} className="min-h-[67px] flex-row items-center justify-between border-b border-[#E4E9E5]">
              <View><Text className="text-[15px] font-extrabold text-[#1E3D35]">{label}</Text><Text className="mt-[3px] text-xs text-[#71807A]">{caption}</Text></View>
              {selectedType === type && <Text className="text-xl font-extrabold text-[#1E3D35]">✓</Text>}
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
