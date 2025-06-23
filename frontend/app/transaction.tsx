import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams  } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Header from '../components/Header';
import { API_ENDPOINTS } from '../config/api';

export default function TransactionPage() {
  const router = useRouter();
  const { qrCodeData } = useLocalSearchParams();
  
  // État pour la saisie manuelle
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualQrCode, setManualQrCode] = useState('');
  
  // champs du formulaire
  const [operationType, setOperationType] = useState('');
  const [prixTotal, setPrixTotal] = useState('');
  const [loading, setLoading] = useState(false);

  //  Vérifier si c'est une saisie manuelle
  useEffect(() => {
    console.log(' qrCodeData reçu:', qrCodeData);
    if (qrCodeData === 'manual') {
      console.log(' Mode saisie manuelle activé');
      setIsManualEntry(true);
    } else {
      setIsManualEntry(false);
    }
  }, [qrCodeData]);

  // Fonction pour obtenir le QR code final
  const getFinalQrCode = (): string => {
    if (isManualEntry) {
      return manualQrCode.trim();
    }
    // Éviter de retourner "manual" 
    if (qrCodeData === 'manual') {
      return '';
    }
    return Array.isArray(qrCodeData) ? qrCodeData[0] : (qrCodeData as string);
  };

  // Validation 
    const validateForm = (): boolean => {
    // Validation du QR code manuel
    const finalQrCode = getFinalQrCode();
    console.log(' Validation - QR code final:', finalQrCode);
    console.log(' Mode manuel:', isManualEntry);
    console.log(' QR manuel saisi:', manualQrCode);
    
    if (!finalQrCode || finalQrCode === 'manual') {
      Alert.alert('Erreur', 'Veuillez saisir ou scanner un QR code client valide');
      return false;
    }

    if (!operationType.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le type d\'opération (ex: "Achat FIFA 25")');
      return false;
    }

    const prix = parseFloat(prixTotal);
    if (!prix || prix <= 0) {
      Alert.alert('Erreur', 'Le prix total doit être un nombre positif (ex: 67.50)');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      //  token JWT
      const token = await AsyncStorage.getItem('jwt');
      
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté', [
          { text: 'Se connecter', onPress: () => router.push('/login') }
        ]);
        return;
      }

      const finalQrCode = getFinalQrCode();

      console.log(' Envoi transaction:', {
        qr_code_data: finalQrCode,
        operation_type: operationType,
        prix_total: parseFloat(prixTotal)
      });

      // Appel à l'API scan


      const response = await axios.post(API_ENDPOINTS.transaction, {
 

        qr_code_data: finalQrCode,
        operation_type: operationType.trim(),
        prix_total: parseFloat(prixTotal)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log(' Réponse API:', response.data);

      // Succès
      const { transaction } = response.data;
      
      Alert.alert(
        'Transaction réussie !', 
        `Points attribués à ${transaction.client}\n` +
        `Opération: ${transaction.operation_type}\n` +
        `Points: +${transaction.points_awarded}\n` +
        `Nouveau solde: ${transaction.new_balance} points`,
        [
          { 
            text: 'Continuer', 
            onPress: () => {
              // retours
              router.replace('/scanqr');
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('Erreur transaction:', error);
      
      if (error.response?.status === 403) {
        Alert.alert('Accès refusé', 'Vous devez être commerçant pour effectuer cette opération');
      } else if (error.response?.status === 404) {
        Alert.alert('Client non trouvé', 'Ce QR code ne correspond à aucun client');
      } else if (error.response?.data?.error) {
        Alert.alert('Erreur', error.response.data.error);
      } else if (error.request) {
        Alert.alert('Erreur réseau', 'Impossible de contacter le serveur');
      } else {
        Alert.alert('Erreur', 'Une erreur inattendue est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  // Suggestions  
  const suggestionOperations = [
    'Achat jeu PS5',
    'Achat jeu Nintendo Switch', 
    'Achat manette',
    'Achat accessoires',
    'Achat carte cadeau'
  ];

  const applySuggestion = (suggestion: string) => {
    setOperationType(suggestion);
  };

  //  Fonction pour revenir au scan
  const goBackToScan = () => {
    router.replace('/scanqr');
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Retour au scan</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>
          {isManualEntry ? ' Saisie Manuelle' : ' Transaction Scannée'}
        </Text>
        
        {/*  SECTION: Saisie du QR code */}
       {isManualEntry ? (
      <View style={styles.qrInputContainer}>
        <Text style={styles.fieldLabel}>QR Code Client *</Text>
        <TextInput
          style={styles.input}
          placeholder="Saisissez le QR code du client..."
          value={manualQrCode}
          onChangeText={setManualQrCode}
          editable={!loading}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.fieldHint}>
          Tapez le code QR du client (généralement un UUID ou code unique)
        </Text>
        <TouchableOpacity 
          style={styles.scanInsteadButton} 
          onPress={goBackToScan}
          disabled={loading}
        >
          <Text style={styles.scanInsteadText}>Scanner plutôt</Text>
        </TouchableOpacity>
      </View>
    ) : (
      qrCodeData && qrCodeData !== 'manual' && (
        <View style={styles.qrInfoContainer}>
          <Text style={styles.qrInfoTitle}>Client scanné :</Text>
          <Text style={styles.qrCodeText}>{qrCodeData}</Text>
          <TouchableOpacity 
            style={styles.editQrButton} 
            onPress={() => setIsManualEntry(true)}
            disabled={loading}
          >
            <Text style={styles.editQrText}> Modifier</Text>
          </TouchableOpacity>
        </View>
      )
    )}

        {/*  Type d'opération */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Type d'opération *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Achat FIFA 25 - Édition Deluxe"
            value={operationType}
            onChangeText={setOperationType}
            editable={!loading}
            multiline={true}
            numberOfLines={2}
          />
          
          {/* Suggestions rapides */}
          <Text style={styles.suggestionsTitle}>Suggestions rapides :</Text>
          <View style={styles.suggestionsContainer}>
            {suggestionOperations.map((suggestion, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.suggestionButton}
                onPress={() => applySuggestion(suggestion)}
                disabled={loading}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Prix total */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}> Prix total (€) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 67.50"
            value={prixTotal}
            onChangeText={setPrixTotal}
            keyboardType="decimal-pad"
            editable={!loading}
          />
          <Text style={styles.fieldHint}>
           Le nombre de points attribués = prix en euros
          </Text>
        </View>

        {/* Bouton de validation */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.submitButtonText}>Traitement...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Valider la transaction</Text>
          )}
        </TouchableOpacity>

        {/* Informations */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Cette action va attribuer des points de fidélité au client
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
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  qrInputContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  qrInfoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
    position: 'relative',
  },
  qrInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#1976d2',
  },
  qrCodeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#424242',
  },
  editQrButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  editQrText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  scanInsteadButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  scanInsteadText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fieldContainer: {
    marginBottom: 25,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  fieldHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  suggestionsTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    marginBottom: 8,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  suggestionText: {
    fontSize: 12,
    color: '#424242',
  },
  submitButton: {
    backgroundColor: '#333',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});