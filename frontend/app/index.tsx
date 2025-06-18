import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';

export default function IndexScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Bienvenue sur GamePoint, votre programme de fidélité dédié aux passionnés de jeux
        </Text>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/register')}>
          <Text style={styles.buttonText}>S’inscrire</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>Connexion</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/home')}>
          <Text style={styles.secondaryButtonText}>Accéder à la Home</Text>
        </TouchableOpacity>
      </View> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  button: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
  },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 },

  // bas de page
  bottomButtonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  secondaryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#D62828',
  },
  secondaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
