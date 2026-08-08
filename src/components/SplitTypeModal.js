import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export default function SplitTypeModal({ visible, onClose, options, selectedType, onSelect, title }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          {options.map(([type, label, caption]) => (
            <Pressable key={type} onPress={() => onSelect(type)} style={styles.option}>
              <View><Text style={styles.optionTitle}>{label}</Text><Text style={styles.optionCaption}>{caption}</Text></View>
              {selectedType === type && <Text style={styles.selectedCheck}>✓</Text>}
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20, 38, 32, 0.35)' }, modal: { backgroundColor: '#F7F7F3', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 38 }, title: { color: '#1E3D35', fontSize: 20, fontWeight: '800', letterSpacing: -0.5, marginBottom: 12 }, option: { minHeight: 67, borderBottomWidth: 1, borderBottomColor: '#E4E9E5', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, optionTitle: { color: '#1E3D35', fontSize: 15, fontWeight: '800' }, optionCaption: { color: '#71807A', fontSize: 12, marginTop: 3 }, selectedCheck: { color: '#1E3D35', fontSize: 20, fontWeight: '800' },
});
