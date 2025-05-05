import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { X } from 'lucide-react-native';

interface ErrorNotificationProps {
  visible: boolean;
  message?: string;
  onDismiss: () => void;
  onRetry?: () => void;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  visible,
  message = 'Failed to load data. Please try again.',
  onDismiss,
  onRetry,
}) => {
  // Animation value for sliding in/out
  const translateY = React.useRef(new Animated.Value(-100)).current;

  // Animate when visibility changes
  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  // Get theme colors
  const backgroundColor = '#E53935'; // Red color for error
  const textColor = '#FFFFFF'; // White text for error
  const iconColor = '#FFFFFF'; // White icon for error

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor,
          transform: [{ translateY }],
        }
      ]}
    >
      <ThemedText style={[styles.message, { color: textColor }]}>
        {message}
      </ThemedText>

      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <ThemedText style={[styles.retry, { color: textColor }]}>
            Retry
          </ThemedText>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
        <X size={16} color={iconColor} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1000,
  },
  message: {
    flex: 1,
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  retryButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 8,
  },
  retry: {
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 