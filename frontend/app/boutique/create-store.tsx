import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import Header from '../../components/Header';
import * as ImagePicker from 'expo-image-picker';
import { API_ENDPOINTS } from '@/config/api';

interface ImageAsset {
  uri: string;
  fileName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
}

interface ApiErrorResponse {
  message: string;
}

export default function CreateStore(): JSX.Element {
  const router = useRouter();

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [banner, setBanner] = useState<ImageAsset | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const pickBanner = async () => {
    try {
      // Demander les permissions d'abord
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à vos photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Correction ici
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setBanner(result.assets[0]);
        console.log('Image sélectionnée:', result.assets[0]);
      }
    } catch (error) {
      console.error('Erreur sélection image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const handleCreateStore = async (): Promise<void> => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('jwt');

      if (!token) {
        Alert.alert('Erreur', 'Token d\'authentification manquant.');
        return;
      }

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone', phone.trim());
      formData.append('address', address.trim());

      if (banner) {
        // Format corrigé pour React Native et Symfony
        const fileExtension = banner.uri.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
        
        // Créer l'objet fichier avec le bon format
        const file = {
          uri: banner.uri,
          type: mimeType,
          name: `banner_${Date.now()}.${fileExtension}`,
        };
        
        formData.append('banner', file as any);
        
        // Debug : afficher les infos du fichier
        console.log('Fichier à envoyer:', {
          uri: file.uri,
          type: file.type,
          name: file.name,
          size: banner.fileSize
        });
      }

      // Configuration axios pour multipart/form-data

      const response = await axios.post(API_ENDPOINTS.createShop, formData, {
 
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 secondes de timeout
      });

      Alert.alert('Succès', 'Votre boutique a été créée avec succès.', [
        { text: 'OK', onPress: () => router.replace('/profile') }
      ]);

    } catch (error) {
      console.error('Erreur création boutique:', error);
      
      // Meilleure gestion des erreurs avec TypeScript
      let errorMessage = 'Impossible de créer la boutique.';
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        
        if (axiosError.response) {
          // Erreur du serveur
          errorMessage = axiosError.response.data?.message || `Erreur ${axiosError.response.status}`;
        } else if (axiosError.request) {
          // Problème de réseau
          errorMessage = 'Problème de connexion au serveur.';
        }
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Créer ma boutique</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom de la boutique"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
        maxLength={100}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Téléphone"
        placeholderTextColor="#888"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        maxLength={20}
      />
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Adresse complète"
        placeholderTextColor="#888"
        value={address}
        onChangeText={setAddress}
        maxLength={200}
        textAlignVertical="top"
      />

      <TouchableOpacity 
        onPress={pickBanner} 
        style={styles.imagePicker}
        activeOpacity={0.7}
      >
        <Text style={styles.imagePickerText}>
          {banner ? '✅ Image sélectionnée' : '📷 Choisir une image de bannière'}
        </Text>
        {banner && (
          <View style={styles.imageInfo}>
            <Text style={styles.imageInfoText}>
              📱 {banner.fileName || 'Image prête'}
            </Text>
            {banner.fileSize && (
              <Text style={styles.imageSizeText}>
                Taille: {Math.round(banner.fileSize / 1024)} KB
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleCreateStore} 
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={[styles.buttonText, styles.loadingText]}>Création...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Créer la boutique</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  back: { 
    marginVertical: 10 
  },
  backText: { 
    fontSize: 20, 
    color: '#333',
    fontWeight: '500'
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginVertical: 20, 
    textAlign: 'center',
    color: '#333'
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  imagePicker: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
    minHeight: 60,
    justifyContent: 'center',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
  },
  imageInfo: {
    marginTop: 10,
    alignItems: 'center',
  },
  imageInfoText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  imageSizeText: {
    fontSize: 11,
    color: '#adb5bd',
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
});