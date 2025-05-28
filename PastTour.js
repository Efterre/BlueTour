import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Modal  } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ad from './modules/ad';
import CaptainRezerv from './modules/CRezerv';

export default function PastTour({ route, navigation }) {
    const [isCaptainModalVisible, setIsCaptainModalVisible] = useState(false); // Modal görünürlüğü için state
    const [selectedRezervation, setSelectedRezervation] = useState(null); // Seçilen rezervasyonu tutacak state

    const [usertype, setusertype] = useState('');
    const [captainPastTours , setCaptainPastTours] = useState([]);

    useEffect(() => {
        if (route.params?.captainPastTours) {
            setCaptainPastTours(route.params.captainPastTours);
            setusertype('captain'); 
            // Gelen veriyi CaptainRezerv nesnelerine çeviriyoruz
            const formattedTours = route.params.captainPastTours.map((tour) =>
                new CaptainRezerv(
                    tour.rezervationid,  // rezervid
                    tour.tourid,         // tourID
                    tour.captainuserid,  // captainID yerine captainuserid kullanılıyor
                    tour.userid,         // userid
                    tour.username,       // username
                    tour.rezervcapacity, // capacity
                    tour.rezervtourtype, // tourtype
                    tour.rezervdate,     // date
                    tour.starttime,      // starttime
                    tour.endtime,        // endtime
                    tour.isfoodinclude,  // isfoodinclude
                    tour.rezervprice     // rezervprice
                )
            );
            setCaptainPastTours(formattedTours);
        }
    }, [route.params?.captainPastTours]);

    useEffect(() => {
        if (isCaptainModalVisible && !selectedRezervation) {
            // Modal açıldığında, modalın kapanmasını engelleyen başka bir işlem yapılabilir
            console.log('Modal opened:', selectedRezervation);
        }
    }, [isCaptainModalVisible, selectedRezervation]);

    // Text'e tıklandığında modal'ı açma işlemi
    const handleRezervationPress = (item) => {
        // Tıklanan rezervasyonun detaylarını state'e atıyoruz
        setSelectedRezervation(item);  
        setIsCaptainModalVisible(true); // Modal'ı açıyoruz
    };

    const renderRezervItem = ({ item }) => (
        <TouchableOpacity style={styles.rezervItem} onPress={() => handleRezervationPress(item)}>
            <SafeAreaView>
                <Text style={styles.rezervText}>{item.username} - {item.date} - {item.rezervprice} </Text>
            </SafeAreaView>
        </TouchableOpacity>
    );
     
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

    const pastTours = [
        new Ad(3, [require('./assets/images/emre_emir1_right.jpeg')], "Geçmiş Tur 1", "Boarding", "Ayvalik", true, 300, 30, 5, "hour"),
        new Ad(4, [require('./assets/images/emre_emir1_cross.jpeg')], "Geçmiş Tur 2", "Daily", "Cunda", true, 300, 30, 5, "hour"),
    ];

    // Modal'ı kapatma fonksiyonu
    const closeModal = () => {
        setIsCaptainModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Past Tours</Text>
            </View>

            {usertype === 'appuser' && (
                <FlatList
                    data={pastTours}
                    renderItem={renderTourItem}
                    keyExtractor={item => item.tourID.toString()}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            {usertype === 'captain' && (
                <FlatList
                    data={captainPastTours}
                    renderItem={renderRezervItem}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            {/* Rezervasyon Detayları Modal */}
            <Modal
                visible={isCaptainModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {selectedRezervation && (
                            <>
                                <Text style={styles.modalTitle}>Reservation Details</Text>
                                <Text>Username: {selectedRezervation.username}</Text>
                                <Text>Date: {selectedRezervation.date}</Text>
                                <Text>Price: {selectedRezervation.rezervprice}</Text>
                                <Text>Capacity: {selectedRezervation.capacity}</Text>
                                <Text>Start Time: {selectedRezervation.starttime}</Text>
                                <Text>End Time: {selectedRezervation.endtime}</Text>
                            </>
                        )}
                        <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
    rezervItem: {
        flexDirection: 'row', // Eğer sağa sola yerleştirmek isterseniz
        padding: 10,  // Alan bırakmak için
        borderBottomWidth: 1, // Alt çizgi eklemek için
        borderColor: '#ddd', // Çizgi rengi
        backgroundColor: '#fff', // Arka plan rengi
    },
    rezervText: {
        fontSize: 16, // Yazı boyutu
        color: '#333', // Yazı rengi
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Yarı şeffaf arka plan
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    closeButton: {
        backgroundColor: '#007bff',
        padding: 10,
        marginTop: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
});
