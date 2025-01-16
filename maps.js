import React from 'react';
import MapView, { UrlTile } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

const OpenStreetMapExample = () => {
  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 39.3129,  // Ayvalık'ın enlem koordinatı
          longitude: 26.6932, // Ayvalık'ın boylam koordinatı
          latitudeDelta: 0.0922, // Haritanın dikey ölçeği
          longitudeDelta: 0.0421, // Haritanın yatay ölçeği
        }}
      >
        {/* OpenStreetMap Katmanı */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={5}  // Harita zoom seviyesi
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default OpenStreetMapExample;
