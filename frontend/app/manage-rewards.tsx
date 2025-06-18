import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';

export default function ManageRewards() {
  const router = useRouter();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  const mockBoutiqueId = 1;

  useEffect(() => {
    const mock = [
      {
        id: 101,
        title: 'Câble PS5 offert',
        description: 'Pour tout achat supérieur à 100€',
        price: 50,
        image: 'https://via.placeholder.com/150',
      },
      {
        id: 102,
        title: 'T-shirt Gamer',
        description: 'Exclusivité pour les clients fidèles',
        price: 120,
        image: 'https://via.placeholder.com/150',
      },
    ];
    setRewards(mock);
    setLoading(false);
  }, []);

  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous supprimer cette récompense ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setRewards(rewards.filter((item) => item.id !== id));
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEdit = (reward: any) => {
    router.push({
      pathname: '/add-reward',
      params: {
        edit: 'true',
        id: reward.id,
        title: reward.title,
        price: reward.price,
        description: reward.description,
        image: reward.image,
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header />

      {/* Flèche retour */}
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Mes récompenses</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add-reward')}
      >
        <Text style={styles.addButtonText}>Ajouter une récompense</Text>
      </TouchableOpacity>

      {rewards.length === 0 ? (
        <Text style={styles.info}>Aucune récompense disponible.</Text>
      ) : (
        <FlatList
          data={rewards}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 60 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.details}>
                <Text style={styles.name}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.price}>{item.price} points</Text>

                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Text style={styles.edit}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={styles.delete}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  back: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  backText: {
    fontSize: 24,
    color: '#333',
  },
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
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 1,
  },
  image: {
    width: 100,
    height: 100,
  },
  details: {
    flex: 1,
    padding: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginVertical: 4,
    fontFamily: 'Poppins',
  },
  price: {
    fontWeight: 'bold',
    marginTop: 4,
    fontFamily: 'Poppins',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  edit: {
    color: '#007bff',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  delete: {
    color: '#dc3545',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  info: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
    fontFamily: 'Poppins',
  },
});
