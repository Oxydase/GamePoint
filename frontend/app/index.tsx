import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GAME POINT</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#D62828' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  button: { backgroundColor: '#333', padding: 15, borderRadius: 8, marginVertical: 10, width: '100%' },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
});
