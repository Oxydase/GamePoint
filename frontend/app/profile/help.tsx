
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';

export default function HelpScreen() {
  const router = useRouter();
  const phone = '0601020304';
  const email = 'support@gamepoint.fr';
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Besoin d’aide ?</Text>
        <Text style={styles.text}>Pour toute demande technique ou assistance :</Text>
        <Text style={styles.link} onPress={() => Linking.openURL(`tel:${phone}`)}>📞 {phone}</Text>
        <Text style={styles.link} onPress={() => Linking.openURL(`mailto:${email}`)}>✉️ {email}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 20 },
  back: { marginBottom: 10 },
  backText: { fontSize: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  text: { fontSize: 14, marginBottom: 15 },
  link: { color: '#F0180C', fontSize: 16, marginBottom: 10, textDecorationLine: 'underline' },
});
