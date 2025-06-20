import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BoutiqueScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [boutique, setBoutique] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://192.168.0.31:8000';

  const getAuthToken = async () => {
    const token = await AsyncStorage.getItem('jwt');
    return token;
  };

  const loadBoutiqueData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/shops/${id}/rewards`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Non authentifié');
        if (response.status === 404) throw new Error('Boutique non trouvée');
        throw new Error('Erreur lors du chargement des données');
      }

      const data = await response.json();
      setBoutique({
        id: data.shop.id,
        name: data.shop.name,
        address: data.shop.address,
        cover: data.shop.banner
          ? `http://192.168.0.31:8000/uploads/${data.shop.banner}`
          : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlzKdFB5-HncSf7fwX5GikTPDI-S1TRJenaA&s',
        points: data.user_balance,
        avantages: data.rewards.map(reward => ({
          id: reward.id,
          title: reward.name,
          prix: reward.points_cost,
          desc: reward.description,
          canRedeem: reward.can_redeem,
          alreadyExchanged: reward.already_exchanged,
          quantityAvailable: reward.quantity_available
        }))
      });

    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError(err.message);
      Alert.alert('Erreur', err.message, [
        { text: 'Retour', onPress: () => router.back() },
        { text: 'Réessayer', onPress: loadBoutiqueData }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadBoutiqueData();
    }
  }, [id]);

  const handleRewardPress = async (reward) => {
    if (!reward.canRedeem) {
      let message = '';
      if (reward.alreadyExchanged) message = 'Vous avez déjà échangé cette récompense.';
      else if (boutique.points < reward.prix) message = `Vous n'avez pas assez de points pour "${reward.title}". Il vous faut ${reward.prix} points.`;
      else if (reward.quantityAvailable <= 0) message = 'Cette récompense n\'est plus disponible.';
      else message = 'Cette récompense ne peut pas être échangée pour le moment.';

      Alert.alert('Échange impossible', message);
      return;
    }

    try {
      const token = await getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/redeem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reward_id: reward.id })
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erreur', data.error || 'Erreur lors de l\'échange');
        return;
      }

      if (data.success) {
        router.push({
          pathname: '/reward-confirmation',
          params: {
            title: reward.title,
            description: reward.desc,
            points: reward.prix.toString(),
            code: data.exchange.code,
            qrCode: data.exchange.qr_code,
            shop: data.exchange.shop,
            expiresAt: data.exchange.expires_at
          },
        });

        loadBoutiqueData();
      }

    } catch (err) {
      console.error('Erreur lors de l\'échange:', err);
      Alert.alert('Erreur', 'Erreur de connexion lors de l\'échange');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (error && !boutique) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Une erreur s'est produite</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadBoutiqueData}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.coverContainer}>
        <Image source={{ uri: boutique.cover }} style={styles.cover} />
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>{boutique.name}</Text>
        <Text style={styles.address}>{boutique.address}</Text>

        <Text style={styles.section}>Vos points</Text>
        <Text style={styles.points}>{boutique.points} points</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${Math.min((boutique.points / 300) * 100, 100)}%` }]} />
        </View>

        <Text style={styles.section}>Récompenses disponibles</Text>

        {boutique.avantages.length === 0 ? (
          <View style={styles.noRewards}>
            <Text style={styles.noRewardsText}>Aucune récompense disponible pour le moment</Text>
          </View>
        ) : (
          boutique.avantages.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.reward,
                !item.canRedeem && styles.rewardDisabled,
                item.alreadyExchanged && styles.rewardExchanged
              ]}
              onPress={() => handleRewardPress(item)}
            >
              <Image
                source={{ uri: 'https://via.placeholder.com/60' }}
                style={[
                  styles.rewardIcon,
                  !item.canRedeem && styles.rewardIconDisabled
                ]}
              />
              <View style={styles.rewardText}>
                <Text style={[
                  styles.rewardTitle,
                  !item.canRedeem && styles.rewardTitleDisabled
                ]}>
                  {item.title}
                </Text>
                <Text style={styles.rewardSubtitle}>
                  Prix : {item.prix} points
                  {item.quantityAvailable !== undefined && ` • Stock : ${item.quantityAvailable}`}
                </Text>
                <Text style={styles.rewardDesc}>{item.desc}</Text>

                {item.alreadyExchanged && (
                  <Text style={styles.statusText}>✓ Déjà échangée</Text>
                )}
                {!item.canRedeem && !item.alreadyExchanged && boutique.points < item.prix && (
                  <Text style={styles.statusText}>Points insuffisants</Text>
                )}
                {item.quantityAvailable === 0 && (
                  <Text style={styles.statusText}>Stock épuisé</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  coverContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cover: {
    width: 300,
    height: 260,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backText: { fontSize: 20 },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  address: { fontSize: 14, color: '#777', marginBottom: 15 },
  section: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#F0180C'
  },
  points: { fontSize: 18, fontWeight: 'bold', marginVertical: 5 },
  progressBar: {
    height: 8,
    width: '100%',
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progress: {
    height: 8,
    backgroundColor: '#F0180C',
  },
  reward: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rewardDisabled: {
    opacity: 0.6,
    backgroundColor: '#f8f8f8',
  },
  rewardExchanged: {
    backgroundColor: '#e8f5e8',
  },
  rewardIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  rewardIconDisabled: {
    opacity: 0.5,
  },
  rewardText: { flex: 1 },
  rewardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  rewardTitleDisabled: {
    color: '#888',
  },
  rewardSubtitle: {
    color: '#444',
    fontSize: 13,
    marginBottom: 4,
  },
  rewardDesc: {
    color: '#777',
    fontSize: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F0180C',
  },
  noRewards: {
    alignItems: 'center',
    padding: 40,
  },
  noRewardsText: {
    color: '#777',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#F0180C',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#F0180C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
