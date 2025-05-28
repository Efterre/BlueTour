import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerUserWithEmailVerification } from './authService';
import { auth } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen({ navigation }) {
  const apiurl = "apiurl";
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [userType, setUserType] = useState('appuser');
  const [bindingNumber, setBindingNumber] = useState('');
  const [boatName, setBoatName] = useState('');
  const [boatType, setBoatType] = useState('');
  const [material, setMaterial] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [boundport, setBoundport] = useState('');

  const handleSignup = async () => {
    if (!username || !email || !password) {
      alert("Lütfen kullanıcı adı, email ve şifre alanlarını doldurun.");
      return;
    }

    if (userType === 'captain' && (!bindingNumber || !boatName || !taxOffice || !taxNumber)) {
      alert("Lütfen kaptan bilgilerini eksiksiz doldurun.");
      return;
    }

    try {
      // Firebase ile kullanıcı kaydı ve e-posta doğrulama
      const userCredential = await registerUserWithEmailVerification(email, password);
      
      // Kullanıcı verilerini veritabanına kaydet
      const response = await fetch(`${apiurl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userType: userType === 'captain' ? 1 : 0,
          username,
          phone,
          password,
          bindingNumber: userType === 'captain' ? bindingNumber : null,
          boatName: userType === 'captain' ? boatName : null,
          boundport: userType === 'captain' ? boundport : null,
          boatType: userType === 'captain' ? boatType : null,
          material: userType === 'captain' ? material : null,
          taxOffice: userType === 'captain' ? taxOffice : null,
          taxNumber: userType === 'captain' ? taxNumber : null,
        }),
      });

      if (response.ok) {
        const userData = {
          userId: userCredential.user.uid,
          userType: userType === 'captain' ? 1 : 0,
          username,
          email,
          captainDetails: userType === 'captain' ? { bindingNumber, boatName, boundport, boatType, material, taxOffice, taxNumber } : null
        };
        await AsyncStorage.setItem('userSession', JSON.stringify(userData));
        alert('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.');

        // E-posta doğrulama kontrolü
        const checkEmailVerified = async () => {
          await auth.currentUser.reload();

          if (auth.currentUser.emailVerified) {
            // Eğer e-posta doğrulandıysa, user bilgisi ile birlikte 'TourCreation' ya da 'Home' sayfasına yönlendiriyoruz
            const user = auth.currentUser;  // auth'dan mevcut kullanıcı bilgilerini alıyoruz
            navigation.reset({
              index: 0,
              routes: [{
                name: userType === 'captain' ? 'CaptainHome' : 'Home',
                params: { user },  // user bilgilerini prop olarak geçiriyoruz
              }],
            });
          } else {
            Alert.alert(
              "E-posta Doğrulama",
              "E-posta adresinizi doğrulamadınız. Lütfen e-posta adresinize gönderilen doğrulama bağlantısına tıklayın.",
              [
                { text: "Tamam", onPress: checkEmailVerified }
              ]
            );
          }
        };

        checkEmailVerified();
      } else {
        const errorData = await response.json();
        alert('Kayıt başarısız: ' + errorData.error);
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      alert('Kayıt sırasında bir hata oluştu.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Yeni Hesap Oluştur</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.userTypeButton, userType === 'appuser' && styles.selectedButton]} onPress={() => setUserType('appuser')}>
          <Text style={styles.buttonText}>App User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.userTypeButton, userType === 'captain' && styles.selectedButton]} onPress={() => setUserType('captain')}>
          <Text style={styles.buttonText}>Captain</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Kullanıcı Adı</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} />

          <Text style={styles.label}>Telefon Numarası</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} />

          <Text style={styles.label}>Şifre</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

          {userType === 'captain' && (
            <>
              <Text style={styles.label}>Bağlama Kütüğü Numarası <Text style={styles.required}>*</Text></Text>
              <TextInput style={styles.input} value={bindingNumber} onChangeText={setBindingNumber} />

              <Text style={styles.label}>Boat Name <Text style={styles.required}>*</Text></Text>
              <TextInput style={styles.input} value={boatName} onChangeText={setBoatName} />

              <Text style={styles.label}>Bağlama Limanı <Text style={styles.required}>*</Text></Text>
              <TextInput style={styles.input} value={boundport} onChangeText={setBoundport} />

              <Text style={styles.label}>Tekne Tipi</Text>
              <TextInput style={styles.input} value={boatType} onChangeText={setBoatType} />

              <Text style={styles.label}>Gövde</Text>
              <TextInput style={styles.input} value={material} onChangeText={setMaterial} />

              <Text style={styles.label}>Vergi Dairesi <Text style={styles.required}>*</Text></Text>
              <TextInput style={styles.input} value={taxOffice} onChangeText={setTaxOffice} />

              <Text style={styles.label}>Vergi Levhası Numarası <Text style={styles.required}>*</Text></Text>
              <TextInput style={styles.input} value={taxNumber} onChangeText={setTaxNumber} />
            </>
          )}

          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Zaten hesabın var mı? Giriş yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  headerText: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  userTypeButton: { padding: 10, marginHorizontal: 10, backgroundColor: '#ddd', borderRadius: 5 },
  selectedButton: { backgroundColor: '#089CFF' },
  formContainer: { paddingBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 10, marginBottom: 15 },
  signupButton: { backgroundColor: '#089CFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  loginText: { color: '#089CFF', fontSize: 16, textAlign: 'center', marginTop: 10 },
  required: { color: 'red', fontSize: 16 },
});
