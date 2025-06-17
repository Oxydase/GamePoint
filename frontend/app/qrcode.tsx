import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function QRCodeClient() {
  const clientId = 'CLIENT_ABC123'; // à remplacer par l'ID dynamique reçu via l'API plus tard

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon QR Code personnel</Text>

      <View style={styles.qrWrapper}>
        <QRCode
          value={clientId}
          size={220}
          color="#000"
          backgroundColor="#fff"
        />
      </View>

      <Text style={styles.codeText}>ID : {clientId}</Text>
      <Text style={styles.info}>
        Présentez ce QR code au commerçant lors de votre achat pour cumuler vos points.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 30 },
  qrWrapper: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  codeText: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  info: { textAlign: 'center', fontSize: 13, color: '#555' },
});
