import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode';

export default function ProfileMenu() {
  const router = useRouter();

  interface DecodedToken {
    roles: string[];
  }
  const [isMerchant, setIsMerchant] = useState(false);

  const items = [
    { title: 'Mon profil', subtitle: 'Nom, prénom, adresse, numéro de téléphone...', route: '/profile/details' },
    { title: 'Suppression compte', subtitle: 'Droit suppression de son compte', route: '/profile/delete' },
    { title: 'Voir mes points', subtitle: 'Voir tous les points de chaque boutique', route: '/profile/points' },
    { title: 'Besoin d’aide ?', subtitle: 'Besoin d’aide, problème technique...', route: '/profile/help' },
  ];

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('jwt');
      Alert.alert('Déconnexion', 'Vous avez été déconnecté.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (error) {
      console.error('Erreur de déconnexion :', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter.');
    }
  };

  useEffect(() => {
  const checkRole = async () => {
    const token = await AsyncStorage.getItem('jwt');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        if (decoded.roles.includes('ROLE_MERCHANT')) {
          setIsMerchant(true);
        }
      } catch (error) {
        console.error('Erreur décodage JWT :', error);
      }
    }
  };

  checkRole();
}, []);

  return (
    <View style={styles.container}>
      <Header />
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {items.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => router.push(item.route)} style={styles.item}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </TouchableOpacity>
      ))}

      {isMerchant && (
        <TouchableOpacity
          onPress={() => router.push('/boutique/create-store')}
          style={[styles.item, { backgroundColor: '#e8f5e9' }]}
        >
          <Text style={styles.title}>Créer ma boutique</Text>
          <Text style={styles.subtitle}>Accéder à l’espace commerçant</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  back: { paddingHorizontal: 20, marginVertical: 10 },
  backText: { fontSize: 24, color: '#333' },
  item: { paddingHorizontal: 20, paddingVertical: 15, borderBottomColor: '#eee', borderBottomWidth: 1 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#666' },

  logoutButton: {
    marginTop: 30,
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#F0180C',
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
