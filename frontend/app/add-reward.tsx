import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Header from '../components/Header';

interface DecodedToken {
  roles: string[];
}

export default function AddReward() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [form, setForm] = useState({
    name: '',
    description: '',
    points_cost: '',
    quantity_available: '',
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const isEditing = params.edit === 'true';
  const rewardId = params.id ? parseInt(params.id as string) : null;

  // Vérification du rôle commerçant
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
      
      if (!decoded.roles.includes('ROLE_MERCHANT')) {
        Alert.alert('Accès refusé', 'Cette page est réservée aux commerçants', [
          { text: 'Retour', onPress: () => router.back() }
        ]);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur vérification rôle:', error);
      Alert.alert('Erreur', 'Session invalide', [
        { text: 'Se connecter', onPress: () => router.push('/login') }
      ]);
      return false;
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert('Erreur', 'Le nom de la récompense est obligatoire');
      return false;
    }

    if (!form.description.trim()) {
      Alert.alert('Erreur', 'La description est obligatoire');
      return false;
    }

    const pointsCost = parseInt(form.points_cost);
    if (!pointsCost || pointsCost <= 0) {
      Alert.alert('Erreur', 'Le coût en points doit être un nombre positif');
      return false;
    }

    const quantity = parseInt(form.quantity_available);
    if (!quantity || quantity <= 0) {
      Alert.alert('Erreur', 'La quantité disponible doit être un nombre positif');
      return false;
    }

    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const token = await AsyncStorage.getItem('jwt');

      const requestData = {
        name: form.name.trim(),
        description: form.description.trim(),
        points_cost: parseInt(form.points_cost),
        quantity_available: parseInt(form.quantity_available),
        is_active: form.is_active
      };

      console.log('📝 Données à envoyer:', requestData);

      let response;

      if (isEditing && rewardId) {
        // Modification d'une récompense existante
        console.log(`🔄 Modification de la récompense ${rewardId}...`);
        
        response = await axios.put(
          `http://172.20.10.2:8000/api/shop/rewards/${rewardId}`,
          requestData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );

        Alert.alert('Succès', 'Récompense modifiée avec succès !');
      } else {
        // Création d'une nouvelle récompense
        console.log('➕ Création d\'une nouvelle récompense...');
        
        response = await axios.post(
          'http://172.20.10.2:8000/api/shop/rewards',
          requestData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );

        Alert.alert('Succès', 'Récompense créée avec succès !');
      }

      console.log('✅ Réponse API:', response.data);

      // Retour à la page de gestion
      router.back();

    } catch (error: any) {
      console.error('❌ Erreur sauvegarde:', error);
      
      if (error.response?.status === 401) {
        setError('Session expirée');
        Alert.alert('Session expirée', 'Veuillez vous reconnecter', [
          { text: 'Se connecter', onPress: () => router.push('/login') }
        ]);
      } else if (error.response?.status === 403) {
        setError('Accès refusé - Cette récompense ne vous appartient pas');
      } else if (error.response?.status === 400) {
        setError('Données invalides');
        Alert.alert('Erreur', error.response.data.error || 'Veuillez vérifier les données saisies');
      } else if (error.response?.status === 404) {
        setError('Récompense non trouvée');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
        Alert.alert('Erreur', error.response.data.error);
      } else if (error.request) {
        setError('Pas de réponse du serveur');
        Alert.alert('Erreur réseau', 'Impossible de contacter le serveur');
      } else {
        setError('Une erreur inattendue est survenue');
        Alert.alert('Erreur', 'Une erreur inattendue est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  // Pré-remplissage en mode édition
  useEffect(() => {
    if (isEditing && params) {
      console.log('📝 Mode édition - Paramètres reçus:', params);
      
      setForm({
        name: (params.name as string) || '',
        description: (params.description as string) || '',
        points_cost: (params.points_cost as string) || '',
        quantity_available: (params.quantity_available as string) || '',
        is_active: params.is_active === 'true'
      });
    }
  }, [isEditing, params]);

  // Vérification d'accès au chargement
  useEffect(() => {
    checkMerchantRole();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header />
      
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        {isEditing ? '✏️ Modifier la récompense' : '➕ Ajouter une récompense'}
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {/* Nom de la récompense */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Nom de la récompense *</Text>
        <TextInput
          placeholder="Ex: T-shirt Gamer, Figurine Mario..."
          style={styles.input}
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
          editable={!loading}
          maxLength={150}
        />
        <Text style={styles.fieldHint}>Maximum 150 caractères</Text>
      </View>

      {/* Description */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Description *</Text>
        <TextInput
          placeholder="Décrivez votre récompense en détail..."
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={(text) => setForm({ ...form, description: text })}
          editable={!loading}
          maxLength={255}
        />
        <Text style={styles.fieldHint}>Maximum 255 caractères</Text>
      </View>

      {/* Coût en points */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Coût en points *</Text>
        <TextInput
          placeholder="Ex: 150"
          keyboardType="numeric"
          style={styles.input}
          value={form.points_cost}
          onChangeText={(text) => setForm({ ...form, points_cost: text })}
          editable={!loading}
        />
        <Text style={styles.fieldHint}>Nombre de points nécessaires pour obtenir cette récompense</Text>
      </View>

      {/* Quantité disponible */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Quantité disponible *</Text>
        <TextInput
          placeholder="Ex: 10"
          keyboardType="numeric"
          style={styles.input}
          value={form.quantity_available}
          onChangeText={(text) => setForm({ ...form, quantity_available: text })}
          editable={!loading}
        />
        <Text style={styles.fieldHint}>Stock initial de cette récompense</Text>
      </View>

      {/* Statut actif/inactif */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Récompense active</Text>
        <Switch
          value={form.is_active}
          onValueChange={(value) => setForm({ ...form, is_active: value })}
          disabled={loading}
          trackColor={{ false: '#767577', true: '#28a745' }}
          thumbColor={form.is_active ? '#fff' : '#f4f3f4'}
        />
      </View>
      <Text style={styles.switchHint}>
        {form.is_active 
          ? '✅ La récompense sera visible aux clients' 
          : '❌ La récompense sera masquée aux clients'
        }
      </Text>

      {/* Bouton de soumission */}
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.buttonText}>
              {isEditing ? 'Modification...' : 'Création...'}
            </Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>
            {isEditing ? '💾 Enregistrer les modifications' : '➕ Créer la récompense'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Informations */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ℹ️ Informations importantes :</Text>
        <Text style={styles.infoText}>
          • Les clients pourront échanger leurs points contre cette récompense{'\n'}
          • Vous pouvez modifier ou désactiver cette récompense à tout moment{'\n'}
          • Les récompenses inactives ne sont pas visibles aux clients{'\n'}
          • Une fois créée, vous recevrez les demandes d'échange à valider
        </Text>
      </View>

      {isEditing && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ Les modifications s'appliqueront immédiatement. Les échanges en cours ne seront pas affectés.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  backButton: { padding: 15 },
  backButtonText: { fontSize: 16, color: '#333' },
  
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingHorizontal: 20,
    color: '#333',
  },
  
  // Error
  errorContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  errorText: {
    fontSize: 14,
    color: '#856404',
  },
  
  // Form fields
  fieldContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  fieldHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  
  // Switch
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  switchHint: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  
  // Submit button
  button: {
    backgroundColor: '#F0180C',
    padding: 18,
    borderRadius: 8,
    marginHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Info sections
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 18,
  },
  
  warningContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
});