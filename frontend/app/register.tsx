import { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';

export default function RegisterScreen() {
  const [isMerchant, setIsMerchant] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Mot de passe"
        style={styles.input}
        secureTextEntry
      />
      <TextInput
        placeholder="Nom"
        style={styles.input}
      />
      <TextInput
        placeholder="Prénom"
        style={styles.input}
      />

      <View style={styles.switchContainer}>
        <Switch
          value={isMerchant}
          onValueChange={setIsMerchant}
          trackColor={{ false: '#ccc', true: '#0a84ff' }}
          thumbColor={isMerchant ? '#fff' : '#f4f3f4'}
        />
        <View style={styles.labelContainer}>
          <Text style={styles.labelBold}>Commerçant</Text>
          <Text style={styles.labelSmall}>
            Vous êtes un commerçant et souhaitez référencer votre boutique
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>S’inscrire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 50 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  labelContainer: {
    marginLeft: 10,
    flexShrink: 1,
  },
  labelBold: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  labelSmall: {
    fontSize: 12,
    color: '#555',
  },
});
