import { Image, StyleSheet, Platform , Text , View , Button , ScrollView , TouchableOpacity, TextInput } from 'react-native';
import React , {Component, useState} from 'react';
import Filtre from '../../Filtre.js';

import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native-gesture-handler';

export default function HomeScreen() {
  
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const handleSearch = () => {
    // Arama işlemini yap
    console.log('Aranan :', searchText);
  };
  

  return (
    <SafeAreaView style = {styles.safeAreaHome}>
      <View style = {styles.adView}>
        
        {/* <Image source = {require('../../../assets/images/picture.png')} 
          style = {{width : 200 , height : 70}}
        />  */}

        <Text>Here is an ad area of a tour boat or yachts</Text>

      </View>

      <View style = {styles.SearchBar}> 
          <TouchableOpacity
            onPress = { () => setIsFilterVisible(!isFilterVisible)} >
              <Image source = {require('../../assets/images/filter-list.png')} 
              style={styles.SearchBarIcon}
              />

          </TouchableOpacity>
          <TextInput
            style = {styles.searchInput}
            placeholder='Type Tour Name'
            value = {searchText}
            onChangeText={(text) => setSearchText(text)}
          />
          <TouchableOpacity
            onPress= {handleSearch} >
              <Image source = {require('../../assets/images/search.png')} 
              style={styles.SearchBarIcon}
              />
          </TouchableOpacity>

      </View>
      {isFilterVisible && (
        <ScrollView style={styles.filtreBox}>
          <Filtre />
        </ScrollView>
      )}
      

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaHome : {
    backgroundColor : 'white',
    flex : 1,  
  } ,

  adView : {
    backgroundColor : 'grey',
    flex : 0.08, 
  } ,

  SearchBar : {
    flexDirection : 'row',
    alignItems : 'center',
    marginHorizontal : 20,
    marginVertical: 24
  } ,

  SearchBarIcon: {
    width: 24, height: 24,
    marginRight : 10
  },
  
  searchInput : {
    flex : 1,
    height : 40,
    borderColor: '#089CFF',
    borderWidth : 1,
    borderRadius : 5,
    paddingHorizontal : 10
  } ,

  filtreBox: {
    backgroundColor: 'lightblue',
    padding: 10,
    borderRadius: 10,
    margin: 20,
  },


});
