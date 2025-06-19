import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Camera from '../components/Camera';
import Header from '../components/Header';

export default function ScanScreen() {
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(true);
  const router = useRouter();
  const cameraRef = useRef(null);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!scanned && scanning) {
      console.log(' QR Code scanné:', { type, data });
      setScanned(true);
      setScanning(false);
      
      // vibration pour confirmer le scan 
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Navigation vers la page transaction avec les données scannées
      router.replace({
        pathname: '/transaction',
        params: { qrCodeData: data }
      });
    }
  };

  const resetScan = () => {
    setScanned(false);
    setScanning(true);
  };

  const handleBackPress = () => {
    Alert.alert(
      'Quitter le scan',
      'Voulez-vous vraiment arrêter le scan ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Quitter', onPress: () => router.replace('/home') }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      
      {/* Bouton retour */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}> Scanner un QR Code Client</Text>
        <Text style={styles.instructionsText}>
          Pointez la caméra vers le QR code du client pour l'identifier
        </Text>
        <Text style={[styles.instructionsText, { 
          color: scanning ? '#4CAF50' : '#FF9800',
          fontWeight: 'bold',
          marginTop: 5
        }]}>
          {scanning ? '🟢 Scan actif' : '⏸️ Scan en pause'}
        </Text>
      </View>

      {/* Zone de scan avec overlay */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type="back"
          onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
          barcodeScannerSettings={{ 
            barCodeTypes: ['qr'],
          }}
        />
        
        {/* Overlay avec cadre de scan */}
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          
          <Text style={styles.scanText}>
            {scanned ? 'QR Code détecté !' : 'Placez le QR code dans le cadre'}
          </Text>
        </View>
      </View>

      {/* Boutons d'action */}
      <View style={styles.actionsContainer}>
        {scanned ? (
          <TouchableOpacity style={styles.resetButton} onPress={resetScan}>
            <Text style={styles.resetButtonText}> Scanner à nouveau</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.helpButton} 
            onPress={() => Alert.alert(
              'Aide', 
              'Demandez au client de présenter son QR code personnel depuis l\'application GamePoint.'
            )}
          >
            <Text style={styles.helpButtonText}> Aide</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.manualButton}
          onPress={() => router.push('/transaction?qrCodeData=manual')}
        >
          <Text style={styles.manualButtonText}> Saisie manuelle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    padding: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  instructionsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanText: {
    position: 'absolute',
    bottom: 50,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    gap: 10,
  },
  resetButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  helpButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  manualButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  manualButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});