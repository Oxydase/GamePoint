import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';

export default function TransactionAmount() {
  const router = useRouter();
  const { qrCodeData } = useSearchParams();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const prix_total = parseInt(amount);
    if (!prix_total || prix_total <= 0) {
      Alert.alert('Erreur', 'Le montant doit être un entier positif.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://ton-backend/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Ajouter auth token si nécessaire
        },
        body: JSON.stringify({
          qr_code_data: qrCodeData,
          operation_type: 'purchase', // ou autre selon contexte
          prix_total: prix_total
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Succès', data.message);
        router.back();
      } else {
        Alert.alert('Erreur', data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Montant de la transaction (points à attribuer) :</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        editable={!loading}
      />
      <Button title={loading ? 'Envoi en cours...' : 'Valider'} onPress={handleSubmit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 15,
    borderRadius: 5,
  }
});
