import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListAds({ route, navigation }) {
  const { ads, tourType, filteredAds } = route.params;
  
  // Eğer filtrelenmiş reklamlar varsa onları, yoksa tour tipine göre filtreleme yap
  const displayAds = filteredAds || (tourType ? ads.filter(ad => ad.tourTypes === tourType) : ads);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => navigation.navigate('TourPage', { tourId: item.tourID })}
    >
      <Image source={item.photoURLs[0]} style={styles.adPhoto} />
      <Text style={styles.tourName}>{item.tourName}</Text>
      <Text>Type: {item.tourTypes}</Text>
      <Text>Location: {item.location}</Text>
      <Text>Available: {item.isAvailable ? "Yes" : "No"}</Text>
      <Text>Fee: ${item.feeRentTour}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {tourType ? `${tourType} Tours` : 'Filtered Tours'}
        </Text>
      </View>
      
      <FlatList
        data={displayAds}
        renderItem={renderItem}
        keyExtractor={(item) => item.tourID.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent : 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    
  },
  backButton: {
    fontSize: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 8,
  },
  itemContainer: {
    flex: 1,
    margin: 8,
    padding: 12,
    backgroundColor: '#b0e2ff',
    borderRadius: 8,
  },
  adPhoto: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 4,
  },
  tourName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
}); 