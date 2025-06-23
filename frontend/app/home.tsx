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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { API_ENDPOINTS } from '@/config/api';

interface DecodedToken {
  roles: string[];
}

interface Shop {
  id: number;
  name: string;
  phone: string;
  address: string;
  banner?: string;
  created_at: string;
}

export default function HomeScreen() {
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
    
  const eventsData = [
    { id: 1, title: '50 points offerts', image: 'https://via.placeholder.com/100' },
    { id: 2, title: 'Recevez 15 pts', image: 'https://via.placeholder.com/100' },
    { id: 3, title: '1 jeu  offert', image: 'https://via.placeholder.com/100' },
  ];

  const checkUserRole = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (token) {
        const decoded: DecodedToken = jwtDecode(token);
        if (decoded.roles.includes('ROLE_MERCHANT')) {
          setUserRole('ROLE_MERCHANT');
        } else {
          setUserRole('ROLE_USER');
        }
      }
    } catch (error) {
      console.error('Erreur décodage JWT:', error);
      setUserRole('ROLE_USER');
    }
  };

  const fetchAllShops = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      
      if (!token) {
        return;
      }

      const response = await fetch(API_ENDPOINTS.SHOP, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const shopsData = await response.json();
        setShops(shopsData);
      } else {
        console.error('Erreur lors de la récupération des boutiques');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await checkUserRole();
      await fetchAllShops();
      
      // Simuler le chargement des événements
      const timer = setTimeout(() => {
        setEvents(eventsData);
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    };

    loadData();
  }, []);

  const getShopImageUri = (shop: Shop) => {
    if (shop.banner) {
      return `http://192.168.0.31:8000/uploads/${shop.banner}`;
    }
    // Image par défaut
    return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlzKdFB5-HncSf7fwX5GikTPDI-S1TRJenaA&s';
  };

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
          {/* Ma Boutique - Uniquement pour les marchands */}
          {userRole === 'ROLE_MERCHANT' && myShop && (
            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={styles.sectionTitle}>Ma Boutique</Text>
                <Text style={styles.arrow}>→</Text>
              </View>

              <TouchableOpacity
                style={styles.myShopContainer}
                onPress={() => router.push(`/boutique/${myShop.id}`)}
              >
                <Image 
                  source={{ uri: getShopImageUri(myShop) }} 
                  style={styles.myShopImage} 
                />
                <View style={styles.myShopInfo}>
                  <Text style={styles.myShopName}>{myShop.name}</Text>
                  <Text style={styles.myShopAddress}>{myShop.address}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

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

          {userRole === 'ROLE_MERCHANT' && (
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => router.push('/scanqr')}
            >
              <Text style={styles.scanButtonText}>📷 Scanner un QR Code</Text>
            </TouchableOpacity>
          )}
            
          <TouchableOpacity
            style={styles.rewardsButton}
            onPress={() => router.push('/rewards-list')}
          >
            <Text style={styles.rewardsButtonText}> Mes Récompenses</Text>
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
                  <Image source={{ uri: getShopImageUri(shop) }} style={styles.circle} />
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

  rewardsButton: {
    backgroundColor: '#28a745',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  rewardsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});