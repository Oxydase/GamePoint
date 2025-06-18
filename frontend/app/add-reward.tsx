import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/Header';
import { useRouter } from 'expo-router';

export default function AddReward() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
  });

  const mockBoutiqueId = 1; // 👉 à remplacer par l’ID de la boutique réelle

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setForm({ ...form, image: uri });
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.description || !form.image) {
      Alert.alert('Erreur', 'Merci de remplir tous les champs.');
      return;
    }

    // ✅ À remplacer par ton API Symfony
    Alert.alert('Récompense ajoutée 🎉');
    router.push('/');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header />

      {/* Flèche retour */}
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Ajouter une récompense</Text>

      <TextInput
        placeholder="Nom de la récompense"
        style={styles.input}
        value={form.title}
        onChangeText={(text) => setForm({ ...form, title: text })}
      />
      <TextInput
        placeholder="Prix en points"
        keyboardType="numeric"
        style={styles.input}
        value={form.price}
        onChangeText={(text) => setForm({ ...form, price: text })}
      />
      <TextInput
        placeholder="Description"
        multiline
        numberOfLines={3}
        style={[styles.input, { height: 80 }]}
        value={form.description}
        onChangeText={(text) => setForm({ ...form, description: text })}
      />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>📸 Choisir une image</Text>
      </TouchableOpacity>

      {form.image !== '' && (
        <Image source={{ uri: form.image }} style={styles.imagePreview} resizeMode="cover" />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Ajouter la récompense</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#000',
    marginHorizontal: 20,
  },
  imagePicker: {
    marginHorizontal: 20,
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#333',
    fontWeight: 'bold',
  },
  imagePreview: {
    height: 180,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#F0180C',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});
