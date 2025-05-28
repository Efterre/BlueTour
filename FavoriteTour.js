import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ad from './modules/ad';

export default function FavoriteTour({ navigation }) {
    // Örnek veriler (Gerçek uygulamada API'den gelecek)
    const apiurl = "apiurl";
    const favoriteTours = [
        new Ad(1, [require('./assets/images/emre_emir_right.jpeg')], "Ayvalık Tekne Turu", "Fishing", "Ayvalik", true, 500, 50, 10, "hour"),
        new Ad(2, [require('./assets/images/emre_emir_cross.jpeg')], "Cunda Adası Turu", "Daily", "Cunda Adasi", false, 800, 80, 20, "hour"),
    ];

    const renderTourItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.tourItem}
            onPress={() => navigation.navigate('TourPage', { tourId: item.tourID })}
        >
            <Image source={item.photoURLs[0]} style={styles.tourImage} />
            <View style={styles.tourInfo}>
                <Text style={styles.tourName}>{item.tourName}</Text>
                <Text>Type: {item.tourTypes}</Text>
                <Text>Location: {item.location}</Text>
                <Text>Fee: ${item.feeRentTour}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>My Favorite Tours</Text>
            </View>

            <FlatList
                data={favoriteTours}
                renderItem={renderTourItem}
                keyExtractor={item => item.tourID.toString()}
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
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 15,
    },
    backButtonText: {
        fontSize: 16,
        color: '#089CFF',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 15,
    },
    tourItem: {
        flexDirection: 'row',
        backgroundColor: '#b0e2ff',
        marginBottom: 10,
        borderRadius: 8,
        overflow: 'hidden',
    },
    tourImage: {
        width: 120,
        height: 120,
    },
    tourInfo: {
        flex: 1,
        padding: 10,
    },
    tourName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
}); 