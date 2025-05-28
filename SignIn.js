import React, { Component } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'

class SignIn extends Component {
    state = {
        email : '',
        phone : '' ,
        password: '',
        numberOfCertificateOfRegistry : '' ,
        numberOfTaxCertificate : '',
        boatName : '' ,
        typeOfTour : '' ,
        lengthOfBoat : '',
        widthOfBoat : '' ,
        capacity : '' ,
        location : '' ,
        beginningTimeS : '',
        endingTimeS : '' ,
        availableDates : '' ,
        availableTimeInterval : '',
        foodSitutation : '',
        stopNumber : '',
        stopLocation : '' ,
        fee : '' ,
        feeEachPerson : '' 
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
            <View style = {styles.container}>
                <TextInput style = {styles.input}
                underlineColorAndroid = "transparent"
                placeholder = "Email"
                placeholderTextColor = "#9a73ef"
                autoCapitalize = "none"
                onChangeText = {this.handleEmail}/>

                <TextInput style = {styles.input}
                underlineColorAndroid = "transparent"
                placeholder = "phone"
                placeholderTextColor = "#9a73ef"
                autoCapitalize = "none"
                onChangeText = {this.handlePhone}/>

                <TextInput style = {styles.input}
                underlineColorAndroid = "transparent"
                placeholder = "Password"
                placeholderTextColor = "#9a73ef"
                autoCapitalize = "none"
                onChangeText = {this.handlePassword}/>
                
                <TouchableOpacity
                style = {styles.submitButton}
                onPress = {
                    () => this.login(this.state.email , this.state.phone, this.state.password)
                }>

                <Text style = {styles.submitButtonText}> Submit </Text>
                </TouchableOpacity>
            </View>
        )
    }
}

export default SignIn

const styles = StyleSheet.create({
   container: {
      paddingTop: 23
   },
   input: {
      margin: 15,
      height: 40,
      borderColor: '#7a42f4',
      borderWidth: 1
   },
   submitButton: {
      backgroundColor: '#7a42f4',
      padding: 10,
      margin: 15,
      height: 40,
   },
   submitButtonText:{
      color: 'white'
   }
})