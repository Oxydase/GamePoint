import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Header from '../components/Header';

interface Reward {
  id: number;
  name: string;
  description: string;
  points_cost: number;
  quantity_available: number;
  shop: string;
  shop_id: number;
  user_balance: number;
  can_redeem: boolean;
  already_exchanged: boolean;
}

interface DecodedToken {
  roles: string[];
}

export default function RewardsList() {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');

  // Vérifie du rôle utilisateur
  const checkUserRole = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté', [
          { text: 'Se connecter', onPress: () => router.push('/login') }
        ]);
        return false;
      }

      const decoded: DecodedToken = jwtDecode(token);
      
      if (decoded.roles.includes('ROLE_MERCHANT')) {
        Alert.alert('Accès refusé', 'Cette page est réservée aux clients', [
          { text: 'Retour', onPress: () => router.back() }
        ]);
        return false;
      }

      setUserRole('ROLE_USER');
      return true;
    } catch (error) {
      console.error('Erreur vérification rôle:', error);
      Alert.alert('Erreur', 'Session invalide', [
        { text: 'Se connecter', onPress: () => router.push('/login') }
      ]);
      return false;
    }
  };

  // Récupération des récompenses
  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError('');

      const token = await AsyncStorage.getItem('jwt');
      
      const response = await axios.get('http://192.168.0.31:8000/api/rewards', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      console.log('✅ Récompenses récupérées:', response.data);
      setRewards(response.data.rewards || []);

    } catch (error: any) {
      console.error('❌ Erreur récupération récompenses:', error);
      
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

  // Gestion de l'échange
  const handleRedeem = (reward: Reward) => {
    if (!reward.can_redeem) {
      if (reward.already_exchanged) {
        Alert.alert('Déjà échangé', 'Vous avez déjà échangé cette récompense');
      } else if (reward.user_balance < reward.points_cost) {
        Alert.alert('Points insuffisants', 
          `Il vous faut ${reward.points_cost} points mais vous n'en avez que ${reward.user_balance}`);
      } else if (reward.quantity_available <= 0) {
        Alert.alert('Stock épuisé', 'Cette récompense n\'est plus disponible');
      }
      return;
    }

    Alert.alert(
      'Confirmer l\'échange',
      `Voulez-vous échanger ${reward.points_cost} points contre "${reward.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Échanger', 
          onPress: () => {
            router.push({
              pathname: '/reward-confirmation',
              params: {
                reward_id: reward.id,
                title: reward.name,
                description: reward.description,
                points: reward.points_cost,
                shop: reward.shop
              }
            });
          }
        }
      ]
    );
  };

  // Initialisation
  useEffect(() => {
    const init = async () => {
      const hasAccess = await checkUserRole();
      if (hasAccess) {
        await fetchRewards();
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
          <Text style={styles.loadingText}>Chargement des récompenses...</Text>
        </View>
      </View>
    );
  }

  // Interface d'erreur
  if (error) {
    return (
      <View style={styles.container}>
        <Header />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRewards}>
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
  
  <FlatList
    data={rewards}
    keyExtractor={(item) => item.id.toString()}
    contentContainerStyle={{ paddingBottom: 60 }}
    showsVerticalScrollIndicator={false}
    ListHeaderComponent={() => (
      <View style={{ padding: 20 }}>
        <Text style={styles.pageTitle}> Catalogue des Récompenses</Text>
        <Text style={styles.subtitle}>Échangez vos points contre des récompenses !</Text>
      </View>
    )}
    ListFooterComponent={() => (
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => router.push('/profile/rewards-history')}
      >
        <Text style={styles.historyButtonText}>📜 Voir mon historique d'échanges</Text>
      </TouchableOpacity>
    )}
    ListEmptyComponent={() => (
      <View style={[styles.emptyContainer, { padding: 20 }]}>
        <Text style={styles.emptyTitle}>Aucune récompense disponible</Text>
        <Text style={styles.emptyText}>
          Les commerçants n'ont pas encore ajouté de récompenses.
        </Text>
      </View>
    )}
    renderItem={({ item }) => (
      <View style={[styles.rewardCard, { marginHorizontal: 20 }]}>
        {/* Image placeholder */}
        <Image 
          source={{ uri: 'https://via.placeholder.com/80x80?text=🎁' }} 
          style={styles.rewardImage} 
        />
        
        <View style={styles.rewardDetails}>
          <Text style={styles.rewardName}>{item.name}</Text>
          <Text style={styles.rewardDescription}>{item.description}</Text>
          <Text style={styles.rewardShop}> {item.shop}</Text>
          
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsCost}> {item.points_cost} points</Text>
            <Text style={styles.userBalance}>
              Votre solde: {item.user_balance} pts
            </Text>
          </View>

          <View style={styles.statusContainer}>
            {item.quantity_available <= 0 ? (
              <Text style={styles.statusOutOfStock}>❌ Stock épuisé</Text>
            ) : item.already_exchanged ? (
              <Text style={styles.statusExchanged}>✅ Déjà échangé</Text>
            ) : item.user_balance < item.points_cost ? (
              <Text style={styles.statusInsufficient}>⚠️ Points insuffisants</Text>
            ) : (
              <Text style={styles.statusAvailable}>✅ Disponible</Text>
            )}
            
            <Text style={styles.stock}>Stock: {item.quantity_available}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.redeemButton,
              !item.can_redeem && styles.redeemButtonDisabled
            ]}
            onPress={() => handleRedeem(item)}
            disabled={!item.can_redeem}
          >
            <Text style={[
              styles.redeemButtonText,
              !item.can_redeem && styles.redeemButtonTextDisabled
            ]}>
              {item.already_exchanged ? 'Déjà échangé' : 'Échanger'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )}
  />
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
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 25,
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
    lineHeight: 20,
  },
  
  // Reward Card
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  rewardDetails: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  rewardShop: {
    fontSize: 13,
    color: '#007bff',
    marginBottom: 10,
  },
  pointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pointsCost: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  userBalance: {
    fontSize: 12,
    color: '#28a745',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusAvailable: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: 'bold',
  },
  statusInsufficient: {
    fontSize: 12,
    color: '#ffc107',
    fontWeight: 'bold',
  },
  statusExchanged: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: 'bold',
  },
  statusOutOfStock: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  stock: {
    fontSize: 11,
    color: '#999',
  },
  redeemButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  redeemButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  redeemButtonTextDisabled: {
    color: '#6c757d',
  },
  
  // History button
  historyButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});