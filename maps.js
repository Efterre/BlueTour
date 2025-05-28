import React, { useState, useEffect } from 'react';
import MapView, { UrlTile, Marker } from 'react-native-maps';
import { StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { fetchStops } from './modules/stops';


const CustomMarker = ({ isSelected, stopName }) => {
  return (
    <View style={[styles.markerContainer, isSelected && styles.selectedMarker]}>
      <View style={[
        styles.markerCircle, 
        { backgroundColor: isSelected ? '#4CAF50' : '#FF6B6B' }
      ]}>
        <Text style={styles.markerText}>{stopName.charAt(0)}</Text>
      </View>
    </View>
  );
};

const OpenStreetMapExample = ({ route, navigation }) => {
  const [selectedStops, setSelectedStops] = useState([]);
  const { countyStops, isFilterMode } = route?.params || { 
    countyStops: [], 
    isFilterMode: false 
  };

  const toggleStopSelection = (stop) => {
    setSelectedStops(prevSelected => {
      const isAlreadySelected = prevSelected.some(s => s.stopid === stop.stopid);
      
      if (isAlreadySelected) {
        return prevSelected.filter(s => s.stopid !== stop.stopid);
      } else {
        return [...prevSelected, stop];
      }
    });
  };

  const handleSaveSelectedStops = () => {
    const selectedStopIds = selectedStops.map(stop => stop.stopid);
    if (isFilterMode) {
      navigation.navigate('Home', { filteredStopIds: selectedStopIds });
    } else {
      navigation.navigate('TourCreation', {
        ...route.params,
        selectedStopIds: selectedStopIds,
        returnFromMap: true
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: countyStops[0]?.latitude || 39.3129,
          longitude: countyStops[0]?.longitude || 26.6932,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />

        {countyStops.map((stop) => (
          <Marker
            key={stop.stopid}
            coordinate={{ 
              latitude: parseFloat(stop.latitude), 
              longitude: parseFloat(stop.longitude) 
            }}
            onPress={() => toggleStopSelection(stop)}
          >
            <CustomMarker 
              isSelected={selectedStops.some(s => s.stopid === stop.stopid)}
              stopName={stop.stopname}
            />
          </Marker>
        ))}
      </MapView>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Seçili Duraklar ({selectedStops.length})</Text>
        <ScrollView style={styles.stopsList}>
          {selectedStops.map((stop) => (
            <View key={stop.stopid} style={styles.stopItem}>
              <Text style={styles.stopName}>{stop.stopname}</Text>
              <TouchableOpacity 
                onPress={() => toggleStopSelection(stop)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            onPress={() => setSelectedStops([])} 
            style={[styles.actionButton, styles.clearButton]}
          >
            <Text style={styles.buttonText}>Seçimleri Temizle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleSaveSelectedStops} 
            style={[styles.actionButton, styles.saveButton]}
          >
            <Text style={styles.buttonText}>Seçimleri Kaydet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedMarker: {
    transform: [{ scale: 1.1 }],
  },
  infoBox: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: '40%',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  stopsList: {
    maxHeight: 150,
  },
  stopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  stopName: {
    fontSize: 16,
    flex: 1,
  },
  removeButton: {
    backgroundColor: '#FF6B6B',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default OpenStreetMapExample;