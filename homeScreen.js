<<<<<<< HEAD
import { Image, StyleSheet, Platform , Text , View , Button , ScrollView , TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import React , {Component, useState, useEffect} from 'react'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import Ad from './modules/ad'; 
import Filtre from './favs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ route, navigation }) { 
  const apiurl = "apiurl";
  const [userDetails, setUserDetails] = useState(null);
  const [adsData, setAdsData] = useState([]);
  const [isFiltredView, setIsFiltredView] = useState(false);
  const [filteredAds, setFilteredAds] = useState([]);
  const [filteredTourIds, setFilteredTourIds] = useState([]);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isSearchView, setIsSearchView] = useState(false);
  const [searchedAds, setSearchedAds] = useState([]);


  const loadUserDetails = async () => {
    try {
      const sessionData = await AsyncStorage.getItem('userSession');
      if (sessionData) {
        const userData = JSON.parse(sessionData);
        setUserDetails(userData);
      }
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  useEffect(() => {
    loadUserDetails();
  }, []);


  const toggleSettingsModal = () => {
      setSettingsModalVisible(!settingsModalVisible);
  };

  const loadAdsDatas = async () => {
    try {
      const response = await fetch(`${apiurl}/api/ads`);
      const datas = await response.json();
      // Ads listesini güncelle
      const adsData = datas.map(adData => {
        return new Ad(
          adData.id, 
          [require('./assets/images/picture.png')], 
          adData.name, 
          adData.tourtype || "Unknown", 
          adData.location, 
          adData.available, 
          adData.tourprice || 0, 
          adData.feeunit, 
          adData.reyting || 0 
        );
      });
      // State'e yeni ads listesini set et
      setAdsData(adsData);
      
    } catch (error) {
      console.error('Error fetching ad data:', error);
    }
    
  };
    
  useEffect(() => {
    loadAdsDatas();
  }, [userDetails]);
  
  
  

  const renderItem = ({ item }) => (
    
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => navigation.navigate('TourPage', { tourId: item.tourID, userType: 'appuser', userId: userDetails.userId })}
    >
      <Image source={item.photoURLs[0]} style={styles.adPhoto} />
      <Text style={styles.tourName}>{item.tourName}</Text>
      <Text>Type: {item.tourTypes}</Text>
      <Text>Location: {item.location}</Text>
      <Text>Available: {item.isAvailable ? "Yes" : "No"}</Text>
      <Text>Fee: ${item.feeRentTour}</Text>
    </TouchableOpacity>
  );
  
  const Stack = createNativeStackNavigator();

  const handleFiltreViewChange = (isFiltered, tourIds) => {
    setIsFiltredView(isFiltered);
    if (tourIds) {
        setFilteredTourIds(tourIds);
        if (isFiltered) {
            loadFilteredAds(tourIds);
        } else {
            // Arama sonuçlarını yükle
            loadSearchedAds(tourIds);
            setIsSearchView(true);
        }
    }
  };

  const loadFilteredAds = async (tourIds) => {
    try {
        // Tüm turları al
        const response = await fetch(`${apiurl}/api/ads`);
        const allAds = await response.json();
        
        // Sadece filtrelenmiş ID'lere sahip turları filtrele
        const filtered = allAds.filter(ad => tourIds.includes(ad.id));
        
        // Filtrelenmiş turları Ad sınıfına dönüştür
        const filteredAdsData = filtered.map(adData => {
            return new Ad(
                adData.id, 
                [require('./assets/images/picture.png')], 
                adData.name, 
                adData.tourtype || "Unknown", 
                adData.location, 
                adData.available, 
                adData.tourprice || 0, 
                adData.feeunit, 
                adData.reyting || 0 
            );
        });
        
        setFilteredAds(filteredAdsData);
    } catch (error) {
        console.error('Filtrelenmiş turlar yüklenirken hata:', error);
    }
  };

  const loadSearchedAds = async (tourIds) => {
    try {
        const response = await fetch(`${apiurl}/api/ads`);
        const allAds = await response.json();
        
        // Sadece aranan ID'lere sahip turları filtrele
        const searched = allAds.filter(ad => tourIds.includes(ad.id));
        
        // Arama sonuçlarını Ad sınıfına dönüştür
        const searchedAdsData = searched.map(adData => {
            return new Ad(
                adData.id, 
                [require('./assets/images/picture.png')], 
                adData.name, 
                adData.tourtype || "Unknown", 
                adData.location, 
                adData.available, 
                adData.tourprice || 0, 
                adData.feeunit, 
                adData.reyting || 0 
            );
        });
        
        setSearchedAds(searchedAdsData);
    } catch (error) {
        console.error('Arama sonuçları yüklenirken hata:', error);
    }
  };

  return (
    <SafeAreaView style = {styles.safeAreaViewHome}>
      <View style = {styles.topBarArea}>
        <View style = {styles.adView}>
          
          {/* <Image source = {require('../../../assets/images/picture.png')} 
            style = {{width : 200 , height : 70}}
            />  */}

          <Text>Here is an ad area of a tour boat or yachts</Text>

        </View>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => {
            if (userDetails) {
              navigation.navigate('Settings', { userType: 'appuser' });
            } else {
              alert('Kullanıcı bilgileri yüklenemedi.');
            }
          }}
        >
          <Image source={require('./assets/images/settings.png')} />
        </TouchableOpacity>
      </View>  
      
      <ScrollView style={styles.scrollViewHome}>
        
        <View>
          <Filtre onFiltreViewChange={handleFiltreViewChange}/>
        </View>

        <View style={styles.body}>
          {isSearchView && searchedAds.length > 0 ? (
            <View style={styles.filteredAdsContainer}>
              <Text style={styles.filteredAdsTitle}>Arama Sonuçları</Text>
              {searchedAds.map((item) => (
                <TouchableOpacity 
                  key={item.tourID}
                  style={styles.filteredItemContainer}
                  onPress={() => navigation.navigate('TourPage', { 
                    tourId: item.tourID, 
                    userType: 'appuser', 
                    userId: userDetails.userId 
                  })}
                >
                  <Image source={item.photoURLs[0]} style={styles.filteredAdPhoto} />
                  <View style={styles.filteredItemInfo}>
                    <Text style={styles.filteredTourName}>{item.tourName}</Text>
                    <Text style={styles.filteredItemText}>Type: {item.tourTypes}</Text>
                    <Text style={styles.filteredItemText}>Location: {item.location}</Text>
                    <Text style={styles.filteredItemText}>Available: {item.isAvailable ? "Yes" : "No"}</Text>
                    <Text style={styles.filteredItemText}>Fee: ${item.feeRentTour}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : isFiltredView && filteredAds.length > 0 ? (
            <View style={styles.filteredAdsContainer}>
              <Text style={styles.filteredAdsTitle}>Filtrelenmiş İlanlar</Text>
              {filteredAds.map((item) => (
                <TouchableOpacity 
                  key={item.tourID}
                  style={styles.filteredItemContainer}
                  onPress={() => navigation.navigate('TourPage', { 
                    tourId: item.tourID, 
                    userType: 'appuser', 
                    userId: userDetails.userId 
                  })}
                >
                  <Image source={item.photoURLs[0]} style={styles.filteredAdPhoto} />
                  <View style={styles.filteredItemInfo}>
                    <Text style={styles.filteredTourName}>{item.tourName}</Text>
                    <Text style={styles.filteredItemText}>Type: {item.tourTypes}</Text>
                    <Text style={styles.filteredItemText}>Location: {item.location}</Text>
                    <Text style={styles.filteredItemText}>Available: {item.isAvailable ? "Yes" : "No"}</Text>
                    <Text style={styles.filteredItemText}>Fee: ${item.feeRentTour}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <>
              <View style={styles.horizontalBoatListInfoView}>
                <Text>Local Area Tours</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ListAds', { ads: adsData, tourType: 'Local' })}> 
                  <Text>Select All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={adsData}
                renderItem={renderItem}
                keyExtractor={(item) => item.tourID}
                horizontal
              />
              
              <View style={styles.horizontalBoatListInfoView}>
                <Text>Boarding Tours</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ListAds', { ads: adsData, tourType: 'Boarding' })}> 
                  <Text>Select All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={adsData}
                renderItem={renderItem}
                keyExtractor={(item) => item.tourID}
                horizontal
              />
              
              <View style={styles.horizontalBoatListInfoView}>
                <Text>Daily Tours</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ListAds', { ads: adsData, tourType: 'Daily' })}> 
                  <Text>Select All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={adsData}
                renderItem={renderItem}
                keyExtractor={(item) => item.tourID}
                horizontal
              />
              
              <View style={styles.horizontalBoatListInfoView}>
                <Text>Fishing Tours</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ListAds', { ads: adsData, tourType: 'Fishing' })}> 
                  <Text>Select All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={adsData}
                renderItem={renderItem}
                keyExtractor={(item) => item.tourID}
                horizontal
              />
              
              <View style={styles.horizontalBoatListInfoView}>
                <Text>Diving Tours</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ListAds', { ads: adsData, tourType: 'Diving' })}> 
                  <Text>Select All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={adsData}
                renderItem={renderItem}
                keyExtractor={(item) => item.tourID}
                horizontal
              />
            </>
          )}
        </View>
      </ScrollView>
      <View style={styles.bottomAdView}>
        <Text>This part for ads</Text>
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
  tourName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#333',
  },

  bottomAdView : {
    backgroundColor : 'grey',
    height : 50
  },

  filteredAdsContainer: {
    padding: 10,
  },
  
  filteredAdsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  
  filteredItemContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  filteredAdPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  
  filteredItemInfo: {
    padding: 5,
  },
  
  filteredTourName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  
  filteredItemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

module.exports = HomeScreen;

{/*
select all butonu fonksiyon atanacak.
ayarlar bölümü bitmesi gerekiyor.
search kısmında ister tourname ile arama olacak. ve search fonksiyonu yazılacak.
filtre bölümüne estetik katılacak.
arayüze estetiklik katılacak.
customize kısmında seçilen duraklar filtreleme kısmına işlenecek.

*/}
=======
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
>>>>>>> 1cb0f61753bad1140174d9777c72c9ea3969fc55
