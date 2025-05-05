import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ModalScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const accentColor = useThemeColor('brand');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ 
        title: 'Modal',
        headerStyle: { backgroundColor },
        headerTintColor: textColor,
      }} />
      
      <Text style={[styles.title, { color: textColor }]}>Modal</Text>
      <Text style={[styles.description, { color: textColor }]}>This is a modal screen that can be customized for various purposes.</Text>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: accentColor }]}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Close Modal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 