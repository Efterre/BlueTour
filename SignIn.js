import React, { Component } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet , ScrollView} from 'react-native'

class SignIn extends Component {
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
      return (
         <ScrollView style = {styles.container}>
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
            
            <TouchableOpacity
               style = {styles.submitButton}
               onPress = {
                  () => this.login(this.state.email , this.state.phone, this.state.password)
               }>

               <Text style = {styles.submitButtonText}> Submit </Text>
            </TouchableOpacity>
         </ScrollView>
      )
   }
}

export default SignIn

const styles = StyleSheet.create({
   container: {
      backgroundColor : 'white',
      paddingHorizontal: 10,
      paddingTop:30,
      flex:1
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
      padding: 10,
      margin: 15,
      marginLeft : 300 ,
      height: 40,
      width : 80,
      alignItems: 'center'
   },
   submitButtonText:{
      color: 'white',
      
   }
})