import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const eventsData = [
    { id: 1, title: '50 points offerts', image: 'https://via.placeholder.com/100' },
    { id: 2, title: 'Recevez 15 pts', image: 'https://via.placeholder.com/100' },
    { id: 3, title: '1 jeu d’occasion offert', image: 'https://via.placeholder.com/100' },
  ];

  const shopsData = [
    { id: 1, name: 'Micromania', image: 'https://via.placeholder.com/100' },
    { id: 2, name: 'GameCash', image: 'https://via.placeholder.com/100' },
    { id: 3, name: 'Retro&Geek', image: 'https://via.placeholder.com/100' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setEvents(eventsData);
      setShops(shopsData);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header avec alignement horizontal */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Ionicons name="menu" size={32} color="white" />
        </TouchableOpacity>

        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity onPress={() => router.push('/qrcode')}>
          <Ionicons name="qr-code-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F0180C" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Évènements */}
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.sectionTitle}>Évènements à ne pas louper</Text>
              <Text style={styles.arrow}>→</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {events.map((event) => (
                <View key={event.id} style={styles.circleContainer}>
                  <Image source={{ uri: event.image }} style={styles.circle} />
                  <Text style={styles.circleText}>{event.title}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Grande image centrale */}
          <View style={styles.banner}>
            <Image
              source={require('../assets/images/banner-mario.png')}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push('/scanqr')}
          >
            <Text style={styles.scanButtonText}>Scanner un QR Code</Text>
          </TouchableOpacity>

          {/* Boutiques partenaires */}
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.sectionTitle}>Magasins partenaires</Text>
              <Text style={styles.arrow}>→</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {shops.map((shop) => (
                <TouchableOpacity
                  key={shop.id}
                  style={styles.circleContainer}
                  onPress={() => router.push(`/boutique/${shop.id}`)}
                >
                  <Image source={{ uri: shop.image }} style={styles.circle} />
                  <Text style={styles.circleText}>{shop.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingBottom: 40 },

  header: {
    backgroundColor: '#F0180C',
    height: 150,
    paddingHorizontal: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 100,
    height: 100,
  },

  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  arrow: {
    fontSize: 20,
  },
  circleContainer: {
    marginRight: 15,
    alignItems: 'center',
    width: 100,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
    backgroundColor: '#eee',
  },
  circleText: {
    textAlign: 'center',
    fontSize: 12,
  },
  banner: {
    marginVertical: 25,
    paddingHorizontal: 20,
  },
  bannerImage: {
    width: '100%',
    height: 210,
    borderRadius: 10,
  },
  scanButton: {
  backgroundColor: '#F0180C',
  marginHorizontal: 20,
  paddingVertical: 15,
  borderRadius: 10,
  alignItems: 'center',
  marginBottom: 20,
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
