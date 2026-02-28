import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface DateTimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mode: 'date' | 'time';
  required?: boolean;
  placeholder?: string;
}

export function DateTimeInput({
  label,
  value,
  onChange,
  mode,
  required = false,
  placeholder,
}: DateTimeInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedValue, setSelectedValue] = useState(new Date());

  // Converter formato DD-MM-AAAA para AAAA-MM-DD (HTML5)
  const convertDateToHTML5 = (date: string) => {
    if (!date) return '';
    const parts = date.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // Converter formato AAAA-MM-DD (HTML5) para DD-MM-AAAA
  const convertDateFromHTML5 = (date: string) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleNativeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (date) {
        if (mode === 'date') {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          onChange(`${day}-${month}-${year}`);
        } else {
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          onChange(`${hours}:${minutes}`);
        }
      }
    } else if (date) {
      setSelectedValue(date);
    }
  };

  const confirmIOSValue = () => {
    if (mode === 'date') {
      const year = selectedValue.getFullYear();
      const month = String(selectedValue.getMonth() + 1).padStart(2, '0');
      const day = String(selectedValue.getDate()).padStart(2, '0');
      onChange(`${day}-${month}-${year}`);
    } else {
      const hours = String(selectedValue.getHours()).padStart(2, '0');
      const minutes = String(selectedValue.getMinutes()).padStart(2, '0');
      onChange(`${hours}:${minutes}`);
    }
    setShowPicker(false);
  };

  const Icon = mode === 'date' ? Calendar : Clock;
  const inputPlaceholder = placeholder || (mode === 'date' ? 'DD-MM-AAAA' : 'HH:MM');

  // Renderização para Web
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <input
          type={mode}
          value={mode === 'date' ? convertDateToHTML5(value) : value}
          onChange={(e) => {
            if (mode === 'date') {
              onChange(convertDateFromHTML5(e.target.value));
            } else {
              onChange(e.target.value);
            }
          }}
          required={required}
          style={{
            backgroundColor: Colors.light.card,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: Colors.light.border,
            borderRadius: 12,
            padding: 12,
            fontSize: 16,
            color: Colors.light.text,
            width: '100%',
            minHeight: 48,
            cursor: 'pointer',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
          } as any}
          className={`${mode}-input`}
        />
      </View>
    );
  }

  // Renderização para Mobile (iOS/Android)
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChange}
          placeholder={inputPlaceholder}
          placeholderTextColor={Colors.light.textSecondary}
        />
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowPicker(true)}
        >
          <Icon color={Colors.light.primary} size={20} />
        </TouchableOpacity>
      </View>

      {/* Modal para iOS */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.modalCancel}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {mode === 'date' ? 'Selecione a Data' : 'Selecione a Hora'}
                </Text>
                <TouchableOpacity onPress={confirmIOSValue}>
                  <Text style={styles.modalConfirm}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedValue}
                mode={mode}
                display="spinner"
                onChange={handleNativeChange}
                locale="pt-BR"
                style={styles.dateTimePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* DateTimePicker para Android */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={selectedValue}
          mode={mode}
          display="default"
          onChange={handleNativeChange}
          locale="pt-BR"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 12,
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
  },
  modalCancel: {
    fontSize: 17,
    color: Colors.light.textSecondary,
  },
  modalConfirm: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  dateTimePicker: {
    height: 250,
  },
});
