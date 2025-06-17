import { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} >
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.pageTitle}>Connexion à votre compte</Text>

        <TextInput
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Mot de passe"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Connexion</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.link}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { padding: 15 },
  backButtonText: { fontSize: 16, color: '#333' },
  content: { flex: 1, padding: 20 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
 input: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 15,
  marginBottom: 15,
  backgroundColor: '#fff', 
  color: '#000',           
  fontSize: 16,
}
,
  button: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  link: { color: '#0000EE', textAlign: 'center', marginTop: 15 },
});
