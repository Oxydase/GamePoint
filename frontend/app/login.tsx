import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Mot de passe" style={styles.input} secureTextEntry />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Connexion</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.link}>Mot de passe oublié ?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 100 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, marginBottom: 15 },
  button: { backgroundColor: '#333', padding: 15, borderRadius: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  link: { color: '#0000EE', textAlign: 'center', marginTop: 15 },
});
