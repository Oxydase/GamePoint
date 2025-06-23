import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '../components/Header';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';

export default function RewardConfirmation() {
  const router = useRouter();
  
  const [exchangeData, setExchangeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { reward_id, title, description, points } = useLocalSearchParams();

  const redeemReward = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = await AsyncStorage.getItem('jwt');
      
      if (!token) {
        setError('Token non trouvé');
        return;
      }

      console.log('🔄 Échange de la récompense:', reward_id);
      
      const response = await axios.post(API_ENDPOINTS.redeem, {
        reward_id: parseInt(reward_id)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('✅ Réponse échange:', response.data);
      setExchangeData(response.data.exchange);
      
    } catch (error: any) {
      console.error('❌ Erreur échange:', error);
      
      if (error.response?.status === 401) {
        setError('Session expirée');
        Alert.alert('Session expirée', 'Veuillez vous reconnecter', [
          { text: 'Se connecter', onPress: () => router.push('/login') }
        ]);
      } else if (error.response?.status === 403) {
        setError('Solde insuffisant');
      } else if (error.response?.status === 409) {
        setError('Récompense déjà échangée');
      } else if (error.response?.status === 410) {
        setError('Stock épuisé');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.request) {
        setError('Pas de réponse du serveur');
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reward_id) {
      redeemReward();
    } else {
      setError('ID de récompense manquant');
      setLoading(false);
    }
  }, []);

  // Calcul des données d'affichage
  const code = exchangeData?.code || '';
  const qrCodeImage = exchangeData?.qr_code_image || '';
  const expirationDate = exchangeData?.expires_at ? new Date(exchangeData.expires_at) : new Date();
  const dateString = expirationDate.toLocaleDateString('fr-FR');

  // Interface de chargement
  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F0180C" />
          <Text style={styles.loadingText}>Échange en cours...</Text>
          <Text style={styles.loadingSubText}>Génération de votre QR code récompense</Text>
        </View>
      </View>
    );
  }

  // Interface d'erreur
  if (error) {
    return (
      <View style={styles.container}>
        <Header />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Erreur d'échange</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={redeemReward}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backToListButton} onPress={() => router.push('/rewards-list')}>
            <Text style={styles.backToListButtonText}>Retour aux récompenses</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Interface principale (succès)
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
        <Text style={styles.confirmButtonText}>✅ Échange réussi ! Présentez ce QR code</Text>
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
        {code ? (
          <>
            <QRCode value={code} size={200} />
            <Text style={styles.qrText}>Montrez ce code au commerçant</Text>
            <Text style={styles.qrCodeText}>Code unique : #{code}</Text>
          </>
        ) : (
          <Text style={styles.qrErrorText}>Erreur génération QR code</Text>
        )}
      </View>

      {/* Expiration */}
      <View style={styles.expireBox}>
        <Text style={styles.expireText}> Expire le {dateString}</Text>
        <Text style={styles.expireSub}>À récupérer dans les 24 heures</Text>
      </View>

      {/* Boutons d'action */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => router.push('/profile/rewards-history')}
        >
          <Text style={styles.historyButtonText}>📜 Voir mes échanges</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.rewardsButton}
          onPress={() => router.push('/rewards-list')}
        >
          <Text style={styles.rewardsButtonText}>🎁 Autres récompenses</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  // Back button
  backButton: { padding: 15 },
  backButtonText: { fontSize: 16, color: '#333' },
  
  // Header
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
  
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  loadingSubText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  
  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backToListButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  backToListButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Success content
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    padding: 20,
  },
  qrText: {
    marginTop: 15,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  qrCodeText: {
    fontSize: 13,
    color: '#777',
    marginTop: 8,
  },
  qrErrorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  expireBox: {
    backgroundColor: '#FFF5C0',
    padding: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
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
  
  // Action buttons
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 10,
  },
  historyButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rewardsButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rewardsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});