import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Modal 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import QRCode from 'react-native-qrcode-svg';
import Header from '../../components/Header';

interface RewardExchange {
  code: string;
  reward_name: string;
  shop: string;
  points_spent: number;
  date_exchange: string;
  expires_at: string;
  status: 'pending' | 'used' | 'expired';
  used_at?: string;
}

interface DecodedToken {
  roles: string[];
}

export default function RewardsHistory() {
  const router = useRouter();
  const [exchanges, setExchanges] = useState<RewardExchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedQR, setSelectedQR] = useState<RewardExchange | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  // Vérification du rôle client
  const checkClientRole = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté', [
          { text: 'Se connecter', onPress: () => router.push('/login') }
        ]);
        return false;
      }

      const decoded: DecodedToken = jwtDecode(token);
      
      // Vérifier que c'est un client (pas un commerçant)
      if (decoded.roles.includes('ROLE_MERCHANT')) {
        Alert.alert('Accès refusé', 'Cette page est réservée aux clients', [
          { text: 'Retour', onPress: () => router.back() }
        ]);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur vérification rôle:', error);
      Alert.alert('Erreur', 'Session invalide', [
        { text: 'Se connecter', onPress: () => router.push('/login') }
      ]);
      return false;
    }
  };

  // Récupération de l'historique
  const fetchRewardsHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const token = await AsyncStorage.getItem('jwt');
      
      const response = await axios.get('http://172.20.10.2:8000/api/my-rewards', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      console.log('✅ Historique récupéré:', response.data);
      setExchanges(response.data.exchanges || []);

    } catch (error: any) {
      console.error('❌ Erreur historique:', error);
      
      if (error.response?.status === 401) {
        setError('Session expirée');
        Alert.alert('Session expirée', 'Veuillez vous reconnecter', [
          { text: 'Se connecter', onPress: () => router.push('/login') }
        ]);
      } else if (error.response) {
        setError(error.response.data.message || 'Erreur serveur');
      } else if (error.request) {
        setError('Pas de réponse du serveur');
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  // Afficher le QR code
  const showQRCode = (exchange: RewardExchange) => {
    if (exchange.status !== 'pending') {
      Alert.alert('QR Code indisponible', 'Ce QR code n\'est plus actif');
      return;
    }

    // Vérifier expiration
    const now = new Date();
    const expiration = new Date(exchange.expires_at);
    
    if (now > expiration) {
      Alert.alert('QR Code expiré', 'Ce QR code a expiré et ne peut plus être utilisé');
      return;
    }

    setSelectedQR(exchange);
    setQrModalVisible(true);
  };

  // Fermer la modal QR
  const closeQRModal = () => {
    setQrModalVisible(false);
    setSelectedQR(null);
  };

  // Obtenir le style selon le statut
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { ...styles.status, ...styles.statusPending };
      case 'used':
        return { ...styles.status, ...styles.statusUsed };
      case 'expired':
        return { ...styles.status, ...styles.statusExpired };
      default:
        return styles.status;
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ En attente';
      case 'used': return '✅ Utilisé';
      case 'expired': return '❌ Expiré';
      default: return status;
    }
  };

  // Vérifier si le QR est encore valide
  const isQRValid = (exchange: RewardExchange) => {
    const now = new Date();
    const expiration = new Date(exchange.expires_at);
    return exchange.status === 'pending' && now <= expiration;
  };

  // Initialisation
  useEffect(() => {
    const init = async () => {
      const hasAccess = await checkClientRole();
      if (hasAccess) {
        await fetchRewardsHistory();
      }
    };
    
    init();
  }, []);

  // Interface de chargement
  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loadingText}>Chargement de l'historique...</Text>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>📜 Mes Échanges de Récompenses</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchRewardsHistory}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {exchanges.length === 0 && !error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Aucun échange</Text>
            <Text style={styles.emptyText}>
              Vous n'avez encore échangé aucune récompense.
            </Text>
            <TouchableOpacity 
              style={styles.browseCatalogButton}
              onPress={() => router.push('/rewards-list')}
            >
              <Text style={styles.browseCatalogButtonText}>🎁 Voir le catalogue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Récompenses en attente (QR codes actifs) */}
            {exchanges.filter(ex => ex.status === 'pending').length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 QR Codes à utiliser</Text>
                <Text style={styles.sectionSubtitle}>
                  Présentez ces QR codes en boutique pour récupérer vos récompenses
                </Text>
                {exchanges
                  .filter(ex => ex.status === 'pending')
                  .map((exchange, index) => (
                    <View key={exchange.code} style={[styles.exchangeCard, styles.pendingCard]}>
                      <View style={styles.exchangeHeader}>
                        <Text style={styles.rewardName}>{exchange.reward_name}</Text>
                        <Text style={getStatusStyle(exchange.status)}>
                          {getStatusText(exchange.status)}
                        </Text>
                      </View>
                      
                      <Text style={styles.shopName}> {exchange.shop}</Text>
                      <Text style={styles.pointsSpent}> {exchange.points_spent} points utilisés</Text>
                      
                      <View style={styles.dateContainer}>
                        <Text style={styles.exchangeDate}>
                           Échangé le: {new Date(exchange.date_exchange).toLocaleDateString('fr-FR')}
                        </Text>
                        <Text style={styles.expirationDate}>
                          ⏰ Expire le: {new Date(exchange.expires_at).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.qrButton,
                          !isQRValid(exchange) && styles.qrButtonDisabled
                        ]}
                        onPress={() => showQRCode(exchange)}
                        disabled={!isQRValid(exchange)}
                      >
                        <Text style={[
                          styles.qrButtonText,
                          !isQRValid(exchange) && styles.qrButtonTextDisabled
                        ]}>
                          {isQRValid(exchange) ? '📱 Voir le QR Code' : '❌ QR Code expiré'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                }
              </View>
            )}

            {/* Historique complet */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Historique complet</Text>
              {exchanges.map((exchange, index) => (
                <View key={exchange.code} style={styles.exchangeCard}>
                  <View style={styles.exchangeHeader}>
                    <Text style={styles.rewardName}>{exchange.reward_name}</Text>
                    <Text style={getStatusStyle(exchange.status)}>
                      {getStatusText(exchange.status)}
                    </Text>
                  </View>
                  
                  <Text style={styles.shopName}>📍 {exchange.shop}</Text>
                  <Text style={styles.pointsSpent}>💰 {exchange.points_spent} points utilisés</Text>
                  <Text style={styles.exchangeCode}>🔢 Code: {exchange.code}</Text>
                  
                  <View style={styles.dateContainer}>
                    <Text style={styles.exchangeDate}>
                      📅 Échangé: {new Date(exchange.date_exchange).toLocaleDateString('fr-FR')}
                    </Text>
                    {exchange.used_at && (
                      <Text style={styles.usedDate}>
                        ✅ Utilisé: {new Date(exchange.used_at).toLocaleDateString('fr-FR')}
                      </Text>
                    )}
                  </View>

                  {exchange.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.qrButton}
                      onPress={() => showQRCode(exchange)}
                    >
                      <Text style={styles.qrButtonText}>📱 Voir le QR Code</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal QR Code */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={qrModalVisible}
        onRequestClose={closeQRModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>QR Code Récompense</Text>
            
            {selectedQR && (
              <>
                <Text style={styles.modalRewardName}>{selectedQR.reward_name}</Text>
                <Text style={styles.modalShop}>📍 {selectedQR.shop}</Text>
                
                <View style={styles.qrContainer}>
                  <QRCode 
                    value={selectedQR.code} 
                    size={200}
                    color="#000"
                    backgroundColor="#fff"
                  />
                </View>
                
                <Text style={styles.qrCodeText}>Code: {selectedQR.code}</Text>
                <Text style={styles.modalExpiration}>
                  ⏰ Expire le: {new Date(selectedQR.expires_at).toLocaleDateString('fr-FR')}
                </Text>
                
                <Text style={styles.modalInstructions}>
                  Présentez ce QR code au commerçant pour récupérer votre récompense
                </Text>
              </>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={closeQRModal}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
  },
  
  // Loading & Error
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
  errorContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  errorText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#212529',
    fontWeight: 'bold',
  },
  
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  browseCatalogButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  browseCatalogButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Sections
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 18,
  },
  
  // Exchange Cards
  exchangeCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  exchangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusUsed: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
  },
  statusExpired: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  shopName: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 5,
  },
  pointsSpent: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  exchangeCode: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  dateContainer: {
    marginBottom: 12,
  },
  exchangeDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  expirationDate: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  usedDate: {
    fontSize: 12,
    color: '#28a745',
    marginBottom: 2,
  },
  
  // QR Button
  qrButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  qrButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  qrButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  qrButtonTextDisabled: {
    color: '#6c757d',
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginHorizontal: 20,
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  modalRewardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalShop: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCodeText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalExpiration: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInstructions: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});