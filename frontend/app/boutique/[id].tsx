import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function BoutiqueScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // ⚠️ À remplacer par API Symfony
  const boutique = {
    name: 'All Geeks',
    address: '64 bd Voltaire, 75011 Paris',
    cover: 'https://via.placeholder.com/600x300.png?text=All+Geeks',
    points: 200, // ← points utilisateur dans cette boutique
    avantages: [
      { id: 1, title: '-10€ sur votre commande', prix: 50, desc: 'Valable une fois' },
      { id: 2, title: 'Figurine Manga', prix: 100, desc: 'Édition standard' },
      { id: 3, title: 'Jeu occasion offert', prix: 250, desc: '1 jeu au choix' },
    ],
  };

  const handleRewardPress = (reward: any) => {
    if (boutique.points < reward.prix) {
      Alert.alert('Points insuffisants', `Vous n’avez pas assez de points pour "${reward.title}".`);
      return;
    }

    router.push({
      pathname: '/reward-confirmation',
      params: {
        title: reward.title,
        description: reward.desc,
        points: reward.prix.toString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Image source={{ uri: boutique.cover }} style={styles.cover} />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* INFOS */}
      <View style={styles.content}>
        <Text style={styles.title}>{boutique.name}</Text>
        <Text style={styles.address}>{boutique.address}</Text>

        <Text style={styles.section}>Vos points</Text>
        <Text style={styles.points}>{boutique.points} points</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${Math.min(boutique.points / 3, 100)}%` }]} />
        </View>

        {/* Avantages */}
        {boutique.avantages.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.reward}
            onPress={() => handleRewardPress(item)}
          >
            <Image
              source={{ uri: 'https://via.placeholder.com/60' }}
              style={styles.rewardIcon}
            />
            <View style={styles.rewardText}>
              <Text style={styles.rewardTitle}>{item.title}</Text>
              <Text style={styles.rewardSubtitle}>Prix : {item.prix} points</Text>
              <Text style={styles.rewardDesc}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  cover: { width: '100%', height: 220 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  backText: { fontSize: 20 },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  address: { fontSize: 14, color: '#777', marginBottom: 15 },
  section: { marginTop: 10, fontWeight: 'bold', fontSize: 15, color: '#F0180C' },
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
  },
  rewardIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  rewardText: { flex: 1 },
  rewardTitle: { fontWeight: 'bold' },
  rewardSubtitle: { color: '#444', fontSize: 13 },
  rewardDesc: { color: '#777', fontSize: 12 },
});
