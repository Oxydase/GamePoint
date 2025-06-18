import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileMenu() {
  const router = useRouter();

  const items = [
    { title: 'Mon profil', subtitle: 'Nom, prénom, adresse, numéro de téléphone...', route: '/profile/details' },
    { title: 'Suppression compte', subtitle: 'Droit suppression de son compte', route: '/profile/delete' },
    { title: 'Voir mes points', subtitle: 'Voir tous les points de chaque boutique', route: '/profile/points' },
    { title: 'Besoin d’aide ?', subtitle: 'Besoin d’aide, problème technique...', route: '/profile/help' },
  ];

  const user = {
    role: 'commercant',
    isValidated: true,
    hasBoutique: true,
  };

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

  return (
    <View style={styles.container}>
      <Header />
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* Menu utilisateur classique */}
      {items.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => router.push(item.route)} style={styles.item}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </TouchableOpacity>
      ))}

      {/* Espace commerçant */}
      {user.role === 'commercant' && user.isValidated && (
        <>
          <View style={styles.sectionTitle}>
            <Text style={styles.sectionText}>Espace commerçant</Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push(
                user.hasBoutique
                  ? '/create-shop?edit=true&name=All Geeks&address=64 bd Voltaire&phone=0102030405&cover=https://via.placeholder.com/600x300'
                  : '/create-shop'
              )
            }
            style={styles.item}
          >
            <Text style={styles.title}>
              {user.hasBoutique ? 'Modifier ma boutique' : 'Créer ma boutique'}
            </Text>
            <Text style={styles.subtitle}>Gérez les infos de votre commerce</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/scan-client')} style={styles.item}>
            <Text style={styles.title}>Scanner QR Code client</Text>
            <Text style={styles.subtitle}>Ajoutez des points à un client grâce à son QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/add-reward')} style={styles.item}>
            <Text style={styles.title}>Ajouter une récompense</Text>
            <Text style={styles.subtitle}>Ajoutez une offre pour vos clients fidèles</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/manage-rewards')} style={styles.item}>
            <Text style={styles.title}>Gérer mes récompenses</Text>
            <Text style={styles.subtitle}>Modifier ou supprimer vos offres</Text>
          </TouchableOpacity>
        </>
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

  item: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
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

  sectionTitle: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 20,
  },
  sectionText: {
    fontSize: 14,
    color: '#F0180C',
    fontWeight: 'bold',
  },
});
