// components/ui/Modal.tsx
import React from 'react';
import {
  Modal as RNModal,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import useThemeColor from '../../hooks/useThemeColor';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  animationType?: 'none' | 'slide' | 'fade';
  fullScreen?: boolean;
  testID?: string;
}

const { height } = Dimensions.get('window');

export default function Modal({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  contentStyle,
  titleStyle,
  animationType = 'slide',
  fullScreen = false,
  testID,
}: ModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const overlayColor = useThemeColor({}, 'modalOverlay');
  const borderColor = useThemeColor({}, 'border');

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
        <View
          style={[
            styles.content,
            {
              backgroundColor,
              borderColor,
              maxHeight: fullScreen ? '95%' : height * 0.7,
              width: fullScreen ? '95%' : '85%',
            },
            contentStyle,
          ]}
        >
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && (
                <Text
                  style={[styles.title, { color: textColor }, titleStyle]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
              )}
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              )}
            </View>
          )}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
});
