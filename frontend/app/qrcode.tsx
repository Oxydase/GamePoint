import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Header from '../components/Header';

interface UserInfo {
  firstname: string;
  lastname: string;
}

export default function QRCodeClient() {
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError('');

      // token JWT 
      const token = await AsyncStorage.getItem('jwt');
      
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté pour voir votre QR code', [
          { text: 'Se connecter', onPress: () => router.push('/login') }
        ]);
        return;
      }

      // Appel 'API 
      const response = await axios.get('http://172.20.10.2:8000/api/user/qr-code', {
      // const response = await axios.get('http://gamepoint-app.alwaysdata.net/api/user/qr-code', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      const { qr_Code_data, qr_code_image, user } = response.data;
      
      setQrCodeData(qr_Code_data);
      setQrCodeImage(qr_code_image);
      setUserInfo(user);

    } catch (error: any) {
      console.error('QR Code fetch error:', error);
      
      if (error.response?.status === 401) {
        setError('Session expirée');
        Alert.alert('Session expirée', 'Veuillez vous reconnecter', [
          { text: 'Se connecter', onPress: () => router.push('/login') }
        ]);
      } else if (error.response) {
        setError(error.response.data.message || 'Erreur lors de la récupération');
      } else if (error.request) {
        setError('Pas de réponse du serveur, vérifiez la connexion');
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchQRCode();
}, []);
  const handleRefresh = () => {
    fetchQRCode();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loadingText}>Chargement de votre QR code...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}> {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.title}>Mon QR Code personnel</Text>

        {userInfo && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.welcomeText}>
               Hello {userInfo.firstname} {userInfo.lastname}
            </Text>
          </View>
        )}
        <View style={styles.qrWrapper}>
          {/* { QR Code généré par react-native-qrcode-svg */} 
          {/* <QRCode
            value={qrCodeData}
            size={220}
            color="#000"
            backgroundColor="#fff"
          /> */}
          
          {/* QR Code depuis l'API  */}
          
          <Image
            source={{ uri: qrCodeImage }}
            style={styles.qrImage}
            resizeMode="contain"
          />
         
        </View>

        <Text style={styles.codeText}>ID : {qrCodeData}</Text>
        <Text style={styles.info}>
          Présentez ce QR code au commerçant lors de votre achat pour cumuler vos points.
        </Text>

        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}> Actualiser</Text>
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
    padding: 15 
  },
  backButtonText: { 
    fontSize: 16, 
    color: '#333' 
  },
  content: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  // infos user
  userInfoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  qrWrapper: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 20,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  codeText: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 8,
    color: '#333',
  },
  info: { 
    textAlign: 'center', 
    fontSize: 13, 
    color: '#555',
    marginBottom: 30,
    lineHeight: 18,
  },
  refreshButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});