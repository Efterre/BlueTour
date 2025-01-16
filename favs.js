import React , {useState , useRef} from 'react';
import { StyleSheet, Image, Platform , Text, View, TouchableOpacity , TextInput, Modal } from 'react-native';
import Filtre from './Filtre';
import Map from './maps';
import { SafeAreaView } from 'react-native-safe-area-context'; 



export default function Boats() { 
    
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [mapModalVisible, setMapModalVisible] = useState(false);
  

  const filtreRef = useRef();

  const resetFilters = () => {
    if (filtreRef.current) {
        filtreRef.current.clearFilter(); // Filtre bileşeninin resetFilters fonksiyonunu çağır
    }
};

  const toggleFiltreModal = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const handleSearch = () => {
    
    console.log('Aranan :', searchText);
    
  };
  return (
    <SafeAreaView style = {styles.safeAreaExplore}>
      <View style={styles.header}>


        <View style = {styles.searchBar}> 
            <TouchableOpacity
              onPress = { toggleFiltreModal } >
                <Image 
                  source = {require('./assets/images/filter-list.png')} 
                  style={styles.searchBarIcon} >
                </Image>

            </TouchableOpacity>
            <TextInput
              style = {styles.searchInput}
              placeholder='Type Tour Name'
              value = {searchText}
              onChangeText={(text) => setSearchText(text)}
              >
            </TextInput>

            <TouchableOpacity
              style={styles.locationSearchBar}
              onPress={() => setMapModalVisible(true)}
              >
              <Text>Customize</Text>
            </TouchableOpacity>
            <Modal
                visible={mapModalVisible}
                transparent={false}
                onRequestClose={() => setMapModalVisible(false)}
            >
                <View style={styles.mapModalContainer}>
                  
                  <Map/>

                  <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setMapModalVisible(false)}
                      >
                      <Text style={styles.closeButtonText}>Close Map</Text>
                  </TouchableOpacity>
                </View>
            </Modal>
            
            <TouchableOpacity
              onPress= {handleSearch} >
                <Image source = {require('./assets/images/search.png')} 
                style={styles.searchBarIcon} >
                </Image>
            </TouchableOpacity>

        </View>

        <Modal
                visible={isFilterVisible}
                animationType="slide"
                transparent={false}  // Modal tam ekran olacak
                onRequestClose={toggleFiltreModal}
                >
          <View style={styles.fullScreenModal}>
            <View style={styles.filtreTopBar}>  
              <TouchableOpacity onPress={toggleFiltreModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
            
            <Filtre ref={filtreRef} /> 

            <View style={styles.filtreBottomBar}>
              <TouchableOpacity onPress={toggleFiltreModal} style={styles.applyButtonOnFiltre}>
                <Text>Apply</Text>
              </TouchableOpacity>

              <TouchableOpacity style = {styles.clearButtonOnFiltre} onPress={resetFilters} >
                <Text>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
      
      <View style ={styles.body}>

      </View>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create
(
  {
    header:{
      
    },
    adView:{
      backgroundColor : 'grey',
      height : 50,
      width : '100%'
    },
    safeAreaExplore:{
      flex : 1,
      backgroundColor : 'white'
    },
    searchBar:{
      flexDirection : 'row',
      alignItems : 'center',
      marginHorizontal : 2,
      marginVertical: 2,
      padding : 4
    } ,
    searchBarIcon:{
      width: 24, height: 24,
      margin : 10
    },
    searchInput:{
      flex : 1,
      height : 40,
      borderColor: '#089CFF',
      borderWidth : 1,
      borderRadius : 5,
      paddingHorizontal : 10
    },
    locationSearchBar:{
      padding: 2,
      margin: 2
    },
    fullScreenModal:{
      flex: 1, 
      backgroundColor: 'white',
      marginHorizontal : 4,
    },
    filtreTopBar:{
      flexDirection : 'row',
      justifyContent : 'space-between',
      flex : 0.15,
      marginHorizontal : 8,
    },
    filtrePageText:{
      fontSize : 32,
      fontStyle: 'normal',
      alignSelf : 'flex-start',
      backgroundColor : 'white',
      flexDirection : 'row',

    },
    filtreBottomBar:{
      flexDirection : 'row',
      justifyContent : 'flex-end',
      height : 50,
    },
    clearButtonOnFiltre:{
      backgroundColor : '#ff0000',
      justifyContent  : 'center',
      alignItems : 'center',
      marginRight : 5,
      width : 50
    },
    closeButtonText:{
      fontSize: 32,
      fontWeight: 'bold',
      color : 'red',
      
    },
    closeButton:{
      backgroundColor : 'white',
      alignItems : 'center',
      flex : 0.05
    },
    applyButtonOnFiltre:{
      backgroundColor : '#3bfcff',
      justifyContent  : 'center',
      alignItems : 'center',
      marginRight : 60,
      width : 50
    },
    body:{
      flex : 1,
      backgroundColor : 'white',
      
    },
    mapModalContainer:{
      flex:1
    }
  }
);
