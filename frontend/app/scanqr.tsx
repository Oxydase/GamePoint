import React, { useState, useRef } from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import Camera from '../components/Camera';
import { useRouter } from 'expo-router';

export default function ScanScreen() {
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const cameraRef = useRef(null);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      // Naviguer vers page montant en passant la donnée scannée
      router.push({
        pathname: '/transaction',
        params: { qrCodeData: data }
      });
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type="back"
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{ barCodeTypes: ['qr'] }}
      />
      {scanned && <Button title="Scanner à nouveau" onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 }
});
