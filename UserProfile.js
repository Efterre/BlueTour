import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from './firebase';

export default function UserProfile({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    // Kullanıcı bilgilerini veritabanından çek
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        // Veritabanından kullanıcı bilgilerini al
        const userDoc = await firebase.firestore()
          .collection('appuser')
          .doc(user.uid)
          .get();
        
        if (userDoc.exists) {
          setUsername(userDoc.data().username);
          setEmail(user.email);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Kullanıcı adını güncelle
        await firebase.firestore()
          .collection('appuser')
          .doc(user.uid)
          .update({
            username: username
          });

        // Şifre değişikliği varsa
        if (currentPassword && newPassword) {
          await user.updatePassword(newPassword);
        }

        alert('Profil başarıyla güncellendi');
      }
    } catch (error) {
      alert('Güncelleme hatası: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Profil Bilgileri</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Kullanıcı Adı</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mevcut Şifre</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Yeni Şifre</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.updateButton}
          onPress={handleUpdateProfile}
        >
          <Text style={styles.buttonText}>Güncelle</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#089CFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 