import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Header from '../../components/Header';
import { API_ENDPOINTS } from '@/config/api';

interface Reward {
  id: number;
  name: string;
  description: string;
  points_cost: number;
  quantity_available: number;
  is_active: boolean;
  created_at: string;
}

interface DecodedToken {
  roles: string[];
}

export default function ManageRewards() {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');

  // Vérification du rôle 
  const checkMerchantRole = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté', [
          { text: 'Se connecter', onPress: () => router.push('/login') }
        ]);
        return false;
      }

      const decoded: DecodedToken = jwtDecode(token);
      
      // Vérifier si  commerçant
      if (!decoded.roles.includes('ROLE_MERCHANT')) {
        Alert.alert('Accès refusé', 'Cette page est réservée aux commerçants', [
          { text: 'Retour', onPress: () => router.back() }
        ]);
        return false;
      }

      setUserRole('ROLE_MERCHANT');
      return true;
    } catch (error) {
      console.error('Erreur vérification rôle:', error);
      Alert.alert('Erreur', 'Session invalide', [
        { text: 'Se connecter', onPress: () => router.push('/login') }
      ]);
      return false;
    }
  };

  // Récupération des récompenses de la boutique
  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError('');

      const token = await AsyncStorage.getItem('jwt');
      
      console.log('🔄 Récupération des récompenses de la boutique...');

      const response = await axios.get(API_ENDPOINTS.SHOP_REWARDS, {
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
      } else if (error.response?.status === 403) {
        setError('Accès refusé - Commerçant requis');
      } else if (error.response?.status === 400) {
        setError('Boutique non assignée à votre compte');
      } else if (error.response) {
        setError(error.response.data.error || 'Erreur serveur');
      } else if (error.request) {
        setError('Pas de réponse du serveur');
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une récompense
  const handleDelete = (reward: Reward) => {
    Alert.alert(
      'Confirmation',
      `Voulez-vous supprimer la récompense "${reward.name}" ?\n\nCette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteReward(reward.id, reward.name),
        },
      ],
      { cancelable: true }
    );
  };

  // API Suppression
  const deleteReward = async (rewardId: number, rewardName: string) => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      
      console.log(`🗑️ Suppression de la récompense ${rewardId}...`);

      await axios.delete(`http://gamepoint-app.alwaysdata.net/api/shop/rewards/${rewardId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 5000,
      });

      console.log('✅ Récompense supprimée');
      
      // Mettre à jour la liste localement
      setRewards(rewards.filter((item) => item.id !== rewardId));
      
      Alert.alert('Succès', `Récompense "${rewardName}" supprimée avec succès`);

    } catch (error: any) {
      console.error('❌ Erreur suppression:', error);
      
      if (error.response?.status === 403) {
        Alert.alert('Erreur', 'Cette récompense ne vous appartient pas');
      } else if (error.response?.status === 404) {
        Alert.alert('Erreur', 'Récompense non trouvée');
      } else if (error.response?.status === 409) {
        Alert.alert('Erreur', 'Impossible de supprimer cette récompense car des échanges sont en cours');
      } else {
        Alert.alert('Erreur', error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  // Modifier une récompense
  const handleEdit = (reward: Reward) => {
    router.push({
      pathname: '/add-reward',
      params: {
        edit: 'true',
        id: reward.id,
        name: reward.name,
        points_cost: reward.points_cost,
        description: reward.description,
        quantity_available: reward.quantity_available,
        is_active: reward.is_active ? 'true' : 'false'
      },
    });
  };

  // Activer/Désactiver une récompense
  const toggleReward = async (reward: Reward) => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      const action = reward.is_active ? 'désactiver' : 'activer';
      
      Alert.alert(
        'Confirmation',
        `Voulez-vous ${action} la récompense "${reward.name}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: action.charAt(0).toUpperCase() + action.slice(1),
            onPress: async () => {
              try {
                console.log(`🔄 Toggle récompense ${reward.id}...`);

                const response = await axios.patch(
                  `http://gamepoint-app.alwaysdata.net/api/shop/rewards/${reward.id}/toggle`,
                  {},
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                    timeout: 5000,
                  }
                );

                console.log('✅ Récompense toggle:', response.data);

                // Mettre à jour localement
                setRewards(rewards.map(r => 
                  r.id === reward.id 
                    ? { ...r, is_active: response.data.is_active }
                    : r
                ));

                Alert.alert('Succès', response.data.message);

              } catch (error: any) {
                console.error('❌ Erreur toggle:', error);
                Alert.alert('Erreur', error.response?.data?.error || 'Erreur lors de la modification');
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Erreur toggle:', error);
    }
  };

  // Initialisation
  useEffect(() => {
    const init = async () => {
      const hasAccess = await checkMerchantRole();
      if (hasAccess) {
        await fetchRewards();
      }
    };
    
    init();
  }, []);


  // refech 
  
useFocusEffect(
  useCallback(() => {
    if (userRole === 'ROLE_MERCHANT') {
      console.log('🔄 Page focus - Refresh des récompenses');
      fetchRewards();
    }
  }, [userRole])
);


  // Interface de chargement
  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F0180C" />
          <Text style={styles.loadingText}>Chargement de vos récompenses...</Text>
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

      <Text style={styles.title}>🎁 Mes récompenses</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRewards}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add-reward')}
      >
        <Text style={styles.addButtonText}>➕ Ajouter une récompense</Text>
      </TouchableOpacity>

      {rewards.length === 0 && !error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aucune récompense</Text>
          <Text style={styles.emptyText}>
            Vous n'avez pas encore créé de récompenses pour votre boutique.{'\n'}
            Commencez par en ajouter une !
          </Text>
        </View>
      ) : (
        <FlatList
          data={rewards}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 60 }}
          renderItem={({ item }) => (
            <View style={[
              styles.card,
              !item.is_active && styles.cardInactive
            ]}>
            
              <View style={styles.details}>
                <View style={styles.header}>
                  <Text style={[
                    styles.name,
                    !item.is_active && styles.nameInactive
                  ]}>
                    {item.name}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    item.is_active ? styles.statusActive : styles.statusInactive
                  ]}>
                    <Text style={[
                      styles.statusText,
                      item.is_active ? styles.statusTextActive : styles.statusTextInactive
                    ]}>
                      {item.is_active ? '✅ Actif' : '❌ Inactif'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.description}>{item.description}</Text>
                
                <View style={styles.infoRow}>
                  <Text style={styles.price}>💰 {item.points_cost} points</Text>
                  <Text style={styles.stock}>📦 Stock: {item.quantity_available}</Text>
                </View>

                <Text style={styles.dateCreated}>
                  📅 Créé le: {new Date(item.created_at).toLocaleDateString('fr-FR')}
                </Text>

                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.toggleButton}
                    onPress={() => toggleReward(item)}
                  >
                    <Text style={styles.toggleText}>
                      {item.is_active ? '⏸️ Désactiver' : '▶️ Activer'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEdit(item)}
                  >
                    <Text style={styles.edit}>✏️ Modifier</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item)}
                  >
                    <Text style={styles.delete}>🗑️ Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  backButton: { padding: 15 },
  backButtonText: { fontSize: 16, color: '#333' },
  
  // Loading
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
    textAlign: 'center',
  },

  // Error
  errorContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
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
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#212529',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Header
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    paddingHorizontal: 20,
    fontFamily: 'Poppins-Bold',
  },
  addButton: {
    marginHorizontal: 20,
    backgroundColor: '#F0180C',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
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

  // Reward Cards
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardInactive: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa',
  },
  details: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    flex: 1,
    marginRight: 10,
  },
  nameInactive: {
    color: '#6c757d',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#d4edda',
  },
  statusInactive: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusTextActive: {
    color: '#155724',
  },
  statusTextInactive: {
    color: '#721c24',
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#F0180C',
    fontFamily: 'Poppins',
  },
  stock: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: 'bold',
  },
  dateCreated: {
    fontSize: 10,
    color: '#999',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  toggleButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flex: 1,
  },
  toggleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flex: 1,
  },
  edit: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flex: 1,
  },
  delete: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
});