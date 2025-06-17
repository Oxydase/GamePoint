
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';

export default function PointsScreen() {
  const router = useRouter();
  const [points, setPoints] = useState([
    { boutique: 'Micromania', points: 120 },
    { boutique: 'GameCash', points: 80 },
  ]);
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mes points</Text>
        <ScrollView>
          {points.map((entry, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.boutique}>{entry.boutique}</Text>
              <Text style={styles.points}>{entry.points} points</Text>
            </View>
          ))}
        </ScrollView>
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