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