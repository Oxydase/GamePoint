import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Header from '../../components/Header';

export default function CreateStore() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateStore = async () => {
    if (!name || !phone || !address) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('jwt');

      const response = await axios.post('http://192.168.0.31:8000/api/shop/create', {
        name,
        phone,
        address,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      Alert.alert('Succès', 'Votre boutique a été créée avec succès.', [
        { text: 'OK', onPress: () => router.replace('/profile') }
      ]);

    } catch (error) {
      console.error('Erreur création boutique:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de créer la boutique.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Créer ma boutique</Text>

        <TextInput
        style={styles.input}
        placeholder="Nom de la boutique"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
        />
        <TextInput
        style={styles.input}
        placeholder="Téléphone"
        placeholderTextColor="#888"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        />
        <TextInput
        style={styles.input}
        placeholder="Adresse"
        placeholderTextColor="#888"
        value={address}
        onChangeText={setAddress}
        />

      <TouchableOpacity style={styles.button} onPress={handleCreateStore} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Créer la boutique</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  back: { marginVertical: 10 },
  backText: { fontSize: 20, color: '#333' },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
