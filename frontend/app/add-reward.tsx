import { useEffect, useState } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AddReward() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
  });

  const isEditing = params.edit === 'true';

  // 🔒 Simule un utilisateur connecté commerçant
  const user = {
    role: 'commercant', // → à remplacer par un useAuth() ou contexte utilisateur
    isValidated: true,
    boutiqueId: 1,
  };

  // 🔐 Vérifie que seul un commerçant validé peut accéder
  useEffect(() => {
    if (user.role !== 'commercant' || !user.isValidated) {
      Alert.alert(
        'Accès refusé',
        'Seuls les commerçants validés peuvent ajouter des récompenses.'
      );
      router.push('/');
    }
  }, []);

  // Pré-remplit si modification
  useEffect(() => {
    if (isEditing) {
      setForm({
        title: params.title || '',
        description: params.description || '',
        price: params.price?.toString() || '',
        image: params.image || '',
      });
    }
  }, [params]);

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

    try {
      if (isEditing) {
        // ✅ PUT (modifier récompense)
        // await fetch(`https://api.tonapp.com/rewards/${params.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     ...form,
        //     price: parseInt(form.price),
        //   }),
        // });
        Alert.alert('Succès', 'Récompense modifiée.');
      } else {
        // ✅ POST (créer récompense)
        // await fetch(`https://api.tonapp.com/boutiques/${user.boutiqueId}/rewards`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     ...form,
        //     price: parseInt(form.price),
        //   }),
        // });
        Alert.alert('Succès', 'Récompense ajoutée.');
      }

      router.push('/manage-rewards');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header />
      <Text style={styles.title}>
        {isEditing ? 'Modifier une récompense' : 'Ajouter une récompense'}
      </Text>

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
        <Text style={styles.imagePickerText}>Choisir une image</Text>
      </TouchableOpacity>

      {form.image !== '' && (
        <Image source={{ uri: form.image }} style={styles.imagePreview} resizeMode="cover" />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>
          {isEditing ? 'Enregistrer les modifications' : 'Ajouter la récompense'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingHorizontal: 20,
    fontFamily: 'Poppins-Bold',
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
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
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
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
});
