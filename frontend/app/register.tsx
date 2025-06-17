import { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import axios from 'axios';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lastname, setLastname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [phone, setPhone] = useState('');

  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !lastname || !firstname) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    console.log(email, password,lastname,firstname,phone);

    try {
      const response = await axios.post('http://192.168.0.31:8000/api/register', {
        email,
        password,
        lastname,
        firstname,
        phone,
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

        {/* <View style={styles.switchContainer}>
          <Switch
            value={isMerchant}
            onValueChange={setIsMerchant}
            trackColor={{ false: '#ccc', true: '#0a84ff' }}
            thumbColor={isMerchant ? '#fff' : '#f4f3f4'}
          />
          <View style={styles.labelContainer}>
            <Text style={styles.labelBold}>Commerçant</Text>
            <Text style={styles.labelSmall}>
              Vous êtes un commerçant et souhaitez référencer votre boutique
            </Text>
          </View>
        </View> */}

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
