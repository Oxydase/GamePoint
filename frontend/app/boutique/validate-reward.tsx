import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Header from '../../components/Header';
import { API_ENDPOINTS } from '@/config/api';

interface DecodedToken {
  roles: string[];
}

interface RewardValidationData {
  client: string;
  client_email: string;
  type: string;
  description: string;
  message: string;
  validated_at: string;
}

export default function ValidateReward() {
  const router = useRouter();
  const { rewardCode } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [validationData, setValidationData] = useState<RewardValidationData | null>(null);
  const [error, setError] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');

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
      
      // Vérifier que c'est un commerçant
      if (!decoded.roles.includes('ROLE_MERCHANT')) {
        Alert.alert('Accès refusé', 'Cette page est réservée aux commerçants', [
          { text: 'Retour', onPress: () => router.back() }
        ]);
        return false;
      }

      setUserRole('ROLE_MERCHANT');
      return true;
    } catch (error) {
      console.error('Erreur vérification rôle:', error);
      Alert.alert('Erreur', 'Session invalide', [
        { text: 'Se connecter', onPress: () => router.push('/login') }
      ]);
      return false;
    }
  };

  // Validation de la récompense
  const validateReward = async () => {
    if (!rewardCode) {
      setError('Code de récompense manquant');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = await AsyncStorage.getItem('jwt');
      
      console.log('🔄 Validation récompense:', rewardCode);

      const response = await axios.post(API_ENDPOINTS.validateRewards, {
        reward_code: rewardCode
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('✅ Réponse validation:', response.data);

      if (response.data.success) {
        setValidationData(response.data.reward);
        Alert.alert(
          'Récompense validée ! ✅',
          `${response.data.reward.client} a bien récupéré sa récompense "${response.data.reward.type}"`,
          [{ text: 'OK' }]
        );
      }

    } catch (error: any) {
      console.error('❌ Erreur validation:', error);
      
      if (error.response?.status === 403) {
        setError('Accès refusé - Cette récompense n\'appartient pas à votre boutique');
      } else if (error.response?.status === 404) {
        setError('Code de récompense invalide ou introuvable');
      } else if (error.response?.status === 409) {
        setError('Récompense déjà utilisée');
      } else if (error.response?.status === 410) {
        setError('Récompense expirée');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.request) {
        setError('Pas de réponse du serveur, vérifiez la connexion');
      } else {
        setError('Une erreur inattendue est survenue');
      }

      Alert.alert('Erreur de validation', error.response?.data?.error || 'Impossible de valider cette récompense');
    } finally {
      setLoading(false);
    }
  };

  // Retour vers le scanner
  const goBackToScan = () => {
    router.replace('/scanqr');
  };

  // Initialisation
  useEffect(() => {
    const init = async () => {
      const hasAccess = await checkMerchantRole();
      if (hasAccess && rewardCode) {
        // Auto-validation dès l'arrivée sur la page
        await validateReward();
      }
    };
    
    init();
  }, []);

  return (
    <View style={styles.container}>
      <Header />
      
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Retour au scan</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>🎁 Validation Récompense</Text>
        
        {/* Code scanné */}
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Code scanné :</Text>
          <Text style={styles.codeText}>{rewardCode}</Text>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#333" />
            <Text style={styles.loadingText}>Validation en cours...</Text>
          </View>
        )}

        {/* Erreur */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>❌ Erreur de validation</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={validateReward}>
              <Text style={styles.retryButtonText}>🔄 Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Succès */}
        {validationData && !loading && !error && (
          <View style={styles.successContainer}>
            <View style={styles.successHeader}>
              <Text style={styles.successTitle}>✅ Validation Réussie !</Text>
              <Text style={styles.successSubtitle}>Récompense remise au client</Text>
            </View>

            <View style={styles.clientCard}>
              <Text style={styles.clientTitle}>👤 Informations Client</Text>
              <Text style={styles.clientName}>{validationData.client}</Text>
              <Text style={styles.clientEmail}>{validationData.client_email}</Text>
            </View>

            <View style={styles.rewardCard}>
              <Text style={styles.rewardTitle}>🎁 Récompense Validée</Text>
              <Text style={styles.rewardType}>{validationData.type}</Text>
              <Text style={styles.rewardDescription}>{validationData.description}</Text>
            </View>

            <View style={styles.validationInfo}>
              <Text style={styles.validationTime}>
                ⏰ Validé le : {new Date(validationData.validated_at).toLocaleString('fr-FR')}
              </Text>
              <Text style={styles.validationMessage}>
                💬 {validationData.message}
              </Text>
            </View>
          </View>
        )}

        {/* Boutons d'action */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.scanAgainButton} 
            onPress={goBackToScan}
          >
            <Text style={styles.scanAgainText}>📷 Scanner à nouveau</Text>
          </TouchableOpacity>

          {!loading && !error && validationData && (
            <TouchableOpacity 
              style={styles.newValidationButton} 
              onPress={validateReward}
            >
              <Text style={styles.newValidationText}>🔄 Nouvelle validation</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>📋 Instructions :</Text>
          <Text style={styles.instructionsText}>
            • Scannez le QR code de récompense du client{'\n'}
            • Vérifiez l'identité du client{'\n'}
            • Remettez la récompense après validation{'\n'}
            • Le code devient inutilisable après validation
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    padding: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  
  // Code scanné
  codeContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  codeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  codeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
  },
  
  // Loading
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  
  // Error
  errorContainer: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#212529',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Success
  successContainer: {
    marginBottom: 30,
  },
  successHeader: {
    backgroundColor: '#d4edda',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 5,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#155724',
  },
  
  // Client info
  clientCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clientTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  clientEmail: {
    fontSize: 14,
    color: '#666',
  },
  
  // Reward info
  rewardCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  rewardType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  
  // Validation info
  validationInfo: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  validationTime: {
    fontSize: 14,
    color: '#1565c0',
    marginBottom: 8,
  },
  validationMessage: {
    fontSize: 14,
    color: '#1565c0',
    fontStyle: 'italic',
  },
  
  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  scanAgainButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newValidationButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  newValidationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Instructions
  instructionsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});