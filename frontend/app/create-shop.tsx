import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Header from '../components/Header';

export default function CreateShop() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    cover: '',
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setForm({ ...form, cover: imageUri });
    }
  };

  const handleSubmit = async () => {
    // Simulation : ici tu peux remplacer par un appel POST vers l'API
    // avec upload d'image + infos
    Alert.alert('Succès', 'Boutique créée et en attente de validation');
    router.push('/');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header />
      <Text style={styles.title}>Créer ma boutique</Text>

      <TextInput
        placeholder="Nom du magasin"
        style={styles.input}
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />
      <TextInput
        placeholder="Adresse"
        style={styles.input}
        value={form.address}
        onChangeText={(text) => setForm({ ...form, address: text })}
      />
      <TextInput
        placeholder="Téléphone"
        keyboardType="phone-pad"
        style={styles.input}
        value={form.phone}
        onChangeText={(text) => setForm({ ...form, phone: text })}
      />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>📸 Choisir une image de bannière</Text>
      </TouchableOpacity>

      {form.cover !== '' && (
        <Image
          source={{ uri: form.cover }}
          style={styles.imagePreview}
          resizeMode="cover"
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Créer la boutique</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, paddingHorizontal: 20 },
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
