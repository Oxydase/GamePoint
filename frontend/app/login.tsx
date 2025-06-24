import { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {

      const response = await axios.post(API_ENDPOINTS.LOGIN, {

        email: email,  // comme dans security.yaml
        password: password,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000, // timeout optionnel pour éviter blocage
      });

      const data = response.data;

      const token = data.token;
      if (!token) {
        Alert.alert('Erreur', 'Token non reçu');
        return;
      }

      await AsyncStorage.setItem('jwt', token);

      router.push('/home');
    } catch (error: any) {
      console.error('Login error:', error);

      // Gestion d'erreur axios différente selon type
      if (error.response) {
        // Le serveur a répondu avec un status hors 2xx
        Alert.alert('Erreur', error.response.data.message || 'Identifiants invalides');
      } else if (error.request) {
        // La requête a été envoyée mais pas de réponse reçue
        Alert.alert('Erreur', 'Pas de réponse du serveur, vérifiez la connexion');
      } else {
        // Erreur lors de la configuration de la requête
        Alert.alert('Erreur', error.message || 'Une erreur est survenue');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.pageTitle}>Connexion à votre compte</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#888"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor="#888"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Connexion</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.link}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles inchangés
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
  },
  button: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  link: { color: '#0000EE', textAlign: 'center', marginTop: 15 },
});
