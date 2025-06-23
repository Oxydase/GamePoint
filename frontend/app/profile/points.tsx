import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import axios from 'axios';

type Point = {
  id: number;
  shop_id: number;
  shop_name: string;
  points_balance: number;
  updated_at: string;
};

export default function PointsScreen() {
  const router = useRouter();
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await AsyncStorage.getItem('jwt');
        if (!token) {
          Alert.alert('Non connecté', 'Veuillez vous connecter pour voir vos points.', [
            { text: 'Se connecter', onPress: () => router.push('/login') },
          ]);
          return;
        }


        
        const response = await axios.get('http://192.168.0.31:8000/api/loyalty', {
 main
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        });

        setPoints(response.data);
      } catch (err: any) {
        console.error('Erreur récupération points :', err);
        if (err.response?.status === 401) {
          Alert.alert('Session expirée', 'Veuillez vous reconnecter', [
            { text: 'Se connecter', onPress: () => router.push('/login') }
          ]);
        } else if (err.request) {
          setError('Aucune réponse du serveur');
        } else {
          setError('Erreur inconnue lors de la récupération des points');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mes points</Text>

        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        {error && <Text style={{ color: 'red' }}>{error}</Text>}

        {!loading && !error && (
          <ScrollView>
            {points.length === 0 && <Text>Aucun point disponible</Text>}
            {points.map((entry) => (
              <View key={entry.id} style={styles.card}>
                <Text style={styles.boutique}>{entry.shop_name}</Text>
                <Text style={styles.points}>{entry.points_balance} points</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>Mise à jour : {entry.updated_at}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 20 },
  back: { marginBottom: 10 },
  backText: { fontSize: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  card: { padding: 15, backgroundColor: '#eee', borderRadius: 10, marginBottom: 12 },
  boutique: { fontSize: 16, fontWeight: 'bold' },
  points: { fontSize: 14, marginTop: 5 },
});
