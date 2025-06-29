import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';

export default function ProfileDetails() {
  const router = useRouter();
  const [user, setUser] = useState({ nom: '', prenom: '', email: '', telephone: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (!token) return;

        const res = await axios.get(API_ENDPOINTS.userinfos, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;
        setUser({
          nom: data.lastname || '',
          prenom: data.firstname || '',
          email: data.email || '',
          telephone: data.phone || '',
        });
      } catch (error) {
        console.error('Erreur récupération profil', error);
        Alert.alert('Erreur', 'Impossible de récupérer les données du profil.');
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) {
        Alert.alert('Erreur', 'Non connecté');
        return;
      }

      await axios.put(

        API_ENDPOINTS.userinfos,

        {
          firstname: user.prenom,
          lastname: user.nom,
          email: user.email,
          phone: user.telephone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error: any) {
      console.error('Erreur mise à jour profil :', error);
      if (error.response?.data?.message) {
        Alert.alert('Erreur', error.response.data.message);
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mon profil</Text>
        {['nom', 'prenom', 'email', 'telephone'].map((field) => (
          <TextInput
            key={field}
            style={styles.input}
            placeholder={field}
            value={user[field as keyof typeof user]}
            onChangeText={(value) => setUser({ ...user, [field]: value })}
          />
        ))}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 20 },
  back: { marginBottom: 10 },
  backText: { fontSize: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#F0180C',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  saveText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});
