import { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { API_ENDPOINTS } from '@/config/api';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lastname, setLastname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [phone, setPhone] = useState('');
  const [isMerchant, setIsMerchant] = useState(false);
  const [rgpdAccepted, setRgpdAccepted] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !lastname || !firstname) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    console.log(email, password,lastname,firstname,phone);

    if (!rgpdAccepted) {
      Alert.alert('RGPD obligatoire', 'Vous devez accepter les conditions de traitement des données pour créer un compte.');
      return;
    }
    try {
      const response = await axios.post(API_ENDPOINTS.REGISTER, {
        email,
        password,
        lastname,
        firstname,
        phone,
        is_merchant: isMerchant,
        rgpd_accepted: rgpdAccepted
      });

      if (response.status !== 201) {
        Alert.alert('Erreur', response.data.error || response.data.erros || 'Erreur lors de l\'inscription');
        return;
      }

      Alert.alert('Succès', response.data.message, [
        { text: 'OK', onPress: () => router.push('/login') }
      ]);
    } catch (error: any) {
      console.error('Register error:', error);
      if (error.response?.data) {
        Alert.alert('Erreur', error.response.data.error || 'Erreur lors de l\'inscription');
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue');
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Créer un nouveau compte</Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Mot de passe"
            placeholderTextColor="#888"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            placeholder="Nom"
            placeholderTextColor="#888"
            style={styles.input}
            value={lastname}
            onChangeText={setLastname}
          />
          <TextInput
            placeholder="Prénom"
            placeholderTextColor="#888"
            style={styles.input}
            value={firstname}
            onChangeText={setFirstname}
          />
          <TextInput
            placeholder="Téléphone"
            placeholderTextColor="#888"
            style={styles.input}
            keyboardType="numeric"
            returnKeyType="done"
            value={phone}
            onChangeText={setPhone}
          />

          <TouchableOpacity
            onPress={() => setIsMerchant(!isMerchant)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 15,
            }}
          >
            <MaterialIcons
              name={isMerchant ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color="#0a84ff"
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={{ fontWeight: 'bold' }}>Commerçant</Text>
              <Text style={{ fontSize: 12, color: '#555' }}>
                Vous êtes un commerçant et souhaitez référencer votre boutique
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.rgpdContainer}>
            <TouchableOpacity
              onPress={() => setRgpdAccepted(!rgpdAccepted)}
              style={styles.rgpdCheckbox}
            >
              <MaterialIcons
                name={rgpdAccepted ? 'check-box' : 'check-box-outline-blank'}
                size={20}
                color={rgpdAccepted ? '#28a745' : '#ccc'}
              />
              <Text style={styles.rgpdText}>
                J'accepte que GamePoint traite mes données personnelles (nom, email, téléphone) 
                pour gérer mon programme de fidélité conformément à la{' '}
                <Text style={styles.rgpdLink}>politique de confidentialité</Text> *
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  backButton: { 
    padding: 15 
  },
  backButtonText: { 
    fontSize: 16, 
    color: '#333' 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Espace en bas pour éviter que le bouton soit coupé
  },
  content: { 
    flex: 1, 
    padding: 20 
  },
  pageTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginTop: 10, // Petit espace supplémentaire
  },
  buttonText: { 
    color: '#fff', 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
  rgpdContainer: {
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  rgpdCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rgpdText: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    marginLeft: 8,
    lineHeight: 16,
  },
  rgpdLink: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});