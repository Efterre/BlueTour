import { Image, StyleSheet, Platform , Text , View , Button , ScrollView , TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import React , {Component, useState, useEffect} from 'react';
import Filtre from './../../favs';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ad from './../../modules/ad';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Settings from './../../settings';

export default function HomeScreen() {
  // const [ads, setAds] = useState([]);

  // useEffect(() => {
  //   const getAds = async () => {
  //     try {
  //       const data = await fetchAds(); // Veritabanından Ad nesnelerini al
  //       setAds(data); // State'e yükle
  //     } catch (error) {
  //       console.error('Veri çekme hatası:', error);
  //     }
  //   };

  //   getAds();
  // }, []);
   
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const toggleSettingsModal = () => {
      setSettingsModalVisible(!settingsModalVisible);
  };
  
  const ads = [
    new Ad(1, [require('./../../assets/images/emre_emir_right.jpeg')], "Tour 1", "Fishing", "Ayvalik", true, 500, 50, 10, "hour"),
    new Ad(2, [require('./../../assets/images/emre_emir_cross.jpeg')], "Tour 2", "Daily", "Cunda Adasi", false, 800, 80, 20, "hour"),
    new Ad(3, [require('./../../assets/images/emre_emir1_right.jpeg')], "Tour 3", "Boarding", "Ayvalik", true, 300, 30, 5, "hour"),
    new Ad(4, [require('./../../assets/images/emre_emir1_cross.jpeg')], "Tour 3", "Daily", "Cunda", true, 300, 30, 5, "hour"),
  ];

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={item.photoURLs[0]} style = {styles.adPhoto} />
      <Text >{item.tourName}</Text>
      <Text >Type: {item.tourTypes}</Text>
      <Text >Location: {item.location}</Text>
      <Text >Available: {item.isAvailable ? "Yes" : "No"}</Text>
      <Text >Fee: ${item.feeRentTour}</Text>
    </View>
  );
  
  const Stack = createNativeStackNavigator();

  
  return (
    <SafeAreaView style = {styles.safeAreaViewHome}>
      <View style = {styles.topBarArea}>
        <View style = {styles.adView}>
          
          {/* <Image source = {require('../../../assets/images/picture.png')} 
            style = {{width : 200 , height : 70}}
            />  */}

          <Text>Here is an ad area of a tour boat or yachts</Text>

        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={toggleSettingsModal}>
          <Image source={require('./../../assets/images/settings.png')} />
        </TouchableOpacity>
      </View>  
      <ScrollView style = {styles.scrollViewHome}>

        <View>
          <Filtre/>
        </View>

        
        <View style={styles.body}>
          <View style={styles.horizontalBoatListInfoView}>
            <Text> Local Area Tours </Text>
            <TouchableOpacity > 
              <Text> Select All </Text>
            </TouchableOpacity>
          </View>
          <FlatList
              data={ads}
              renderItem={renderItem}
              keyExtractor={(item) => item.tourID}
              horizontal
              />
          
          <View style={styles.horizontalBoatListInfoView}>
            <Text> Boarding Tours </Text>
            <TouchableOpacity > 
              <Text> Select All </Text>
            </TouchableOpacity>
          </View>
          <FlatList
              data={ads}
              renderItem={renderItem}
              keyExtractor={(item) => item.tourID}
              horizontal
              />
          
          <View style={styles.horizontalBoatListInfoView}>
            <Text> Daily Tours </Text>
            <TouchableOpacity> 
              <Text> Select All </Text>
            </TouchableOpacity>
          </View>
          <FlatList
              data={ads}
              renderItem={renderItem}
              keyExtractor={(item) => item.tourID}
              horizontal
            />

          
          <View style={styles.horizontalBoatListInfoView}>
            <Text> Fishing Tours </Text>
            <TouchableOpacity > 
              <Text> Select All </Text>
            </TouchableOpacity>
          </View>
          <FlatList
              data={ads}
              renderItem={renderItem}
              keyExtractor={(item) => item.tourID}
              horizontal
            />
          
          <View style={styles.horizontalBoatListInfoView}>
            <Text> Diving Tours </Text>
            <TouchableOpacity> 
              <Text> Select All </Text>
            </TouchableOpacity>
          </View>
          <FlatList
              data={ads}
              renderItem={renderItem}
              keyExtractor={(item) => item.tourID}
              horizontal
            />

        </View>

        
      </ScrollView>
      <View style={styles.bottomAdView}>
        <Text> This part for ads </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaViewHome : {
    backgroundColor : 'white',
    flex : 1
  } ,
  scrollViewHome:{
    backgroundColor : 'lightblue',
  },

  topBarArea:{
    flexDirection : 'row',
  },

  adView : {
    backgroundColor : 'grey',
    height : 50,
    width : '83%',
  },

  settingsButton : {
    width : '17%',
    height : 50,
    resizeMode: 'contain',
    justifyContent: 'center',  
    alignItems: 'center',     
  },
  settingsModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)', // Arka planı yarı saydam yapmak için
  },
  settingsModalContent: {
      width: '80%',
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5, 
  },
  settingsModalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
  },
  closeSettingsModalButton: {
      marginTop: 15,
      backgroundColor: '#089CFF',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
  },
  closeSettingsModalButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
  },

  body:{
    flex : 1,
    backgroundColor : 'lightblue',
    flexDirection:'column',
  },
  


  locFiltreView:{
    flexDirection : 'row-reverse',
    flex : 1,
  },
  
  locFiltreScrollView:{
    backgroundColor : 'lightblue',
    minHeight : 200,
    maxHeight : 300,
    minWidth : 100,
    maxWidth : 200,
    
  },

  horizontalBoatListInfoView : {
    flexDirection : 'row',
    justifyContent :'space-between',
    
  },

  adPhoto : {
    width : '100%',
    height : 200,
    resizeMode : 'contain'
  },

  itemContainer: {
    padding: 10,
    margin: 5,
    backgroundColor: '#b0e2ff',
    width : 190,
    borderRadius: 8,

  },
  itemText: {
    color: 'white',
  },

  bottomAdView : {
    backgroundColor : 'grey',
    height : 50
  }

});
