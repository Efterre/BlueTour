<<<<<<< HEAD
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from './firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const apiurl = "apiurl";
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      
      const response = await fetch(`${apiurl}/api/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ useremail: email, userpassword: password }),
      });
      
      const data = await response.json();
      console.log("data : ", data);

      if (response.ok && data.success) {
        const userData = {
          userId: data.user.userid,
          userType: data.user.usertype,
          username: data.user.username,
          email: data.user.email,
          captainDetails: data.user.captainDetails
        };
        await AsyncStorage.setItem('userSession', JSON.stringify(userData));
        console.log(userData);
        console.log("data uid : ",data.user.userid);
        
        navigation.reset({
          index: 0,
          routes: [{ 
            name: data.user.usertype === 1 ? 'CaptainHome' : 'Home',
            params: { 
              userType: data.user.usertype === 1 ? 1 : 0,
              captainId: data.user.userid
            }
          }],
        });
        
      } else {
        alert('Giriş başarısız: ' + data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message);
    }
  };

  const handleGuestLogin = () => {
    global.isGuestUser = true;
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home', params: { userType: 'guestuser' } }],
    });
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert('Şifre sıfırlama linki e-posta adresinize gönderildi.');
      setIsForgotPasswordVisible(false);
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('./assets/images/user.png')}
          style={styles.logoImage}
        />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={styles.passwordVisibilityButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Image 
              source={showPassword ? require('./assets/images/look_eye.png') : require('./assets/images/no_look_eye.png')} 
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.guestButton} 
          onPress={handleGuestLogin}
        >
          <Text style={styles.guestButtonText}>Misafir Olarak Devam Et</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signupLink}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.signupText}>Hesabın yok mu? Kayıt ol</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.forgotPasswordLink}
          onPress={() => setIsForgotPasswordVisible(true)}
        >
          <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isForgotPasswordVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.forgotPasswordModal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Şifre Sıfırlama</Text>
            <TextInput
              style={styles.input}
              placeholder="E-posta adresinizi girin"
              value={resetEmail}
              onChangeText={setResetEmail}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsForgotPasswordVisible(false)}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleForgotPassword}
              >
                <Text style={styles.buttonText}>Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#089CFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  guestButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  guestButtonText: {
    color: '#666',
    fontSize: 16,
  },
  signupLink: {
    alignItems: 'center',
  },
  signupText: {
    color: '#089CFF',
    fontSize: 16,
  },
  forgotPasswordLink: {
    alignItems: 'center',
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: '#089CFF',
    fontSize: 14,
  },
  forgotPasswordModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  sendButton: {
    backgroundColor: '#089CFF',
  },
  passwordVisibilityButton: {
    padding: 10,
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
});
=======
import React, { Component } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet , ScrollView, Button} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

class LogIn extends Component {
   state = {
      email : '',
      phone : '' ,
      password: ''
   }
   
   handleEmail = (text) => {
      this.setState({ email: text })
   }
   handlePhone = (text) => {
      this.setState({phone : text})
   }
   handlePassword = (text) => {
      this.setState({ password: text })
   }
   login = (email, pass) => {
      alert('email or phone number: ' + email + ' password: ' + pass)
   }
   render() {
      const { closeModal } = this.props; // closeModal fonksiyonunu props'tan alıyoruz.

      return (
         <SafeAreaView style = {styles.container}>
            <View style={styles.exitButtonView}>
               <TouchableOpacity style={styles.exitButton} onPress={closeModal}>
                  <Text style={styles.exitButtonText} > X </Text>
               </TouchableOpacity>

            </View>

            <View style = {styles.inputContainer} >
               <TextInput style = {styles.input}
                  underlineColorAndroid = "transparent"
                  placeholder = " Email"
                  placeholderTextColor = '#089CFF'
                  autoCapitalize = "none"
                  onChangeText = {this.handleEmail}
                  />

               <TextInput style = {styles.input}
                  underlineColorAndroid = "transparent"
                  placeholder = " Phone"
                  placeholderTextColor = '#089CFF'
                  autoCapitalize = "none"
                  onChangeText = {this.handlePhone}/>

               <TextInput style = {styles.input}
                  underlineColorAndroid = "transparent"
                  placeholder = " Password"
                  placeholderTextColor = "#089CFF"
                  autoCapitalize = "none"
                  secureTextEntry={true}
                  onChangeText = {this.handlePassword}/>
            </View>
            
            <View style={styles.buttonView}>


               <TouchableOpacity
                  style = {styles.submitButton}
                  onPress = {
                     () => this.login(this.state.email , this.state.phone, this.state.password)
                  }>

                  <Text style = {styles.submitButtonText}> Submit </Text>
               </TouchableOpacity>
               

            </View>
         </SafeAreaView>

      )
   }
};

const styles = StyleSheet.create({
   container: {
      backgroundColor : 'white',
      paddingHorizontal: 10,
      paddingTop:30,
      flex:1,
   },
   inputContainer: {
      flexDirection:'column'
   },
   input: {
      margin: 10,
      height: 40,
      borderColor: '#089CFF',
      borderWidth: 1 ,
      borderRadius : 10
   },
   submitButton: {
      backgroundColor: '#089CFF',
      alignItems: 'center',
      padding: 10,
      margin: 15,
      height: 40,
      width : 80,
   },
   submitButtonText:{
      color: 'white',
      fontSize : 16,
      
   },
   buttonView:{
      flexDirection : 'row',
      justifyContent:'space-around'
   },
   exitButtonText:{
      color: 'red',
      fontWeight: '900',
      fontSize: 24,
   },
   exitButton : {
      width : 38,
      alignItems : 'center',
   },
   exitButtonView: {
      
   }


   
})
export default LogIn;
>>>>>>> 1cb0f61753bad1140174d9777c72c9ea3969fc55
