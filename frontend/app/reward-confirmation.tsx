import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '../components/Header';
import QRCode from 'react-native-qrcode-svg';

export default function RewardConfirmation() {
  const router = useRouter();
  const { title, description, points } = useLocalSearchParams();

  const code = `RW${Math.floor(Math.random() * 900000 + 100000)}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);
  const dateString = expirationDate.toLocaleDateString('fr-FR');

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Récupérer ma récompense</Text>
        <Text style={styles.sub}>Présentez ce QR code en boutique</Text>
      </View>

      <View style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>Présentez ce QR code en boutique</Text>
      </View>

      {/* Récompense */}
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.pointBox}>
          <Text style={styles.pointText}>{points} points utilisés</Text>
        </View>
      </View>

      {/* QR Code */}
      <View style={styles.qrContainer}>
        <QRCode value={code} size={200} />
        <Text style={styles.qrText}>Montrez ce code au commerçant</Text>
        <Text style={styles.qrCodeText}>Code unique : #{code}</Text>
      </View>

      {/* Expiration */}
      <View style={styles.expireBox}>
        <Text style={styles.expireText}>Expire le {dateString}</Text>
        <Text style={styles.expireSub}>À récupérer dans les 7 jours</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#F0180C',
  },
  back: { position: 'absolute', top: 20, left: 15 },
  backText: { color: '#fff', fontSize: 20 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  sub: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 5,
  },
  confirmButton: {
    backgroundColor: '#2EAC54',
    padding: 14,
    margin: 20,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    marginBottom: 20,
  },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  description: { fontSize: 13, color: '#555' },
  pointBox: {
    marginTop: 10,
    backgroundColor: '#F0180C',
    padding: 6,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  pointText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrText: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  qrCodeText: {
    fontSize: 13,
    color: '#777',
    marginTop: 5,
  },
  expireBox: {
    backgroundColor: '#FFF5C0',
    padding: 12,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  expireText: {
    fontWeight: 'bold',
    color: '#D96B00',
    fontSize: 14,
  },
  expireSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
