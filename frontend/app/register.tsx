import { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { API_ENDPOINTS } from '@/config/api';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lastname, setLastname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [phone, setPhone] = useState('');
  const [isMerchant, setIsMerchant] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !lastname || !firstname) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    console.log(email, password,lastname,firstname,phone);

    try {
      const response = await axios.post(API_ENDPOINTS.REGISTER, {
        email,
        password,
        lastname,
        firstname,
        phone,
        is_merchant: isMerchant
      });


      if (response.status !== 201) {
        Alert.alert('Erreur', response.data.error || response.data.erros || 'Erreur lors de l\'inscription');
        return;
      }

      Alert.alert('Succès', response.data.message, [
        { text: 'OK', onPress: () => router.push('/login') }
      ]);
    } catch (error: any) {
      console.error('Register error:', error);
      if (error.response?.data) {
        Alert.alert('Erreur', error.response.data.error || 'Erreur lors de l\'inscription');
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.pageTitle}>Créer un nouveau compte</Text>

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
        <TextInput
          placeholder="Nom"
          style={styles.input}
          value={lastname}
          onChangeText={setLastname}
        />
        <TextInput
          placeholder="Prénom"
          style={styles.input}
          value={firstname}
          onChangeText={setFirstname}
        />
        <TextInput
          placeholder="Téléphone"
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <TouchableOpacity
          onPress={() => setIsMerchant(!isMerchant)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
          }}
        >
          <MaterialIcons
            name={isMerchant ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color="#0a84ff"
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>Commerçant</Text>
            <Text style={{ fontSize: 12, color: '#555' }}>
              Vous êtes un commerçant et souhaitez référencer votre boutique
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>S’inscrire</Text>
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
  },
  button: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
