import { Image, StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import LogIn from './LogIn';
import Ad from './modules/ad';
import { auth } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings({ route, navigation }) {
    const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);
    const [isNotificationModalVisible, setNotificationModalVisible] = useState(false);
    const isGuestUser = global.isGuestUser;
    const [user, setUser] = useState(null);
    const [allPastTours, setAllPastTours] = useState([]);
    const { userType, captainId } = route.params; // captainId'yi de alıyoruz

    useEffect(() => {
        if (userType === 'captain' && route.params?.pastRezervedTour) {
            setAllPastTours(route.params.pastRezervedTour);
        }
    }, [userType, route.params?.pastRezervedTour]); 
    
    useEffect(() => {
        const loadUserSession = async () => {
            try {
                const sessionData = await AsyncStorage.getItem('userSession');
                if (sessionData) {
                    const userData = JSON.parse(sessionData);
                    setUser(userData);
                }
            } catch (error) {
                console.error('Error loading user session:', error);
            }
        };

        loadUserSession();
    }, []);

    // Örnek veriler (Gerçek uygulamada API'den gelecek)
    const favoriteTours = [
        new Ad(1, [require('./assets/images/emre_emir_right.jpeg')], "Ayvalık Tekne Turu", "Fishing", "Ayvalik", true, 500, 50, 10, "hour"),
        new Ad(2, [require('./assets/images/emre_emir_cross.jpeg')], "Cunda Adası Turu", "Daily", "Cunda Adasi", false, 800, 80, 20, "hour"),
    ];

    const pastTours = [
        new Ad(3, [require('./assets/images/emre_emir1_right.jpeg')], "Geçmiş Tur 1", "Boarding", "Ayvalik", true, 300, 30, 5, "hour"),
        new Ad(4, [require('./assets/images/emre_emir1_cross.jpeg')], "Geçmiş Tur 2", "Daily", "Cunda", true, 300, 30, 5, "hour"),
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

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userSession');
            await auth.signOut();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error("Çıkış yapılırken hata:", error);
            alert("Çıkış yapılırken bir hata oluştu");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <View style={styles.adView}>
                    <Text>Ad Area</Text>
                </View>
                <TouchableOpacity 
                    style={styles.homeButton}
                    onPress={() => {
                        if (userType === 'captain') {
                            navigation.navigate('CaptainHome', { 
                                userType: '1',
                                captainId: captainId 
                            });
                        } else {
                            navigation.navigate('Home');
                        }
                    }}
                >
                    <Image source={require('./assets/images/ship.png')} style={styles.homeIcon} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Settings Options */}
                <View style={styles.section}>
                    <View style={styles.titleView}>
                        <Text style={styles.sectionTitle}>Settings</Text>
                    </View>

                    {/* Sign Up butonu - Sadece misafir kullanıcı görebilir */}
                    {(!user) && (
                        <TouchableOpacity 
                            style={styles.settingButton}
                            onPress={() => navigation.navigate('Signup')}
                        >
                            <Text style={styles.settingButtonText}>Sign Up</Text>
                        </TouchableOpacity>
                    )}

                    {/* My Favorites - Sadece normal kullanıcı görebilir */}
                    {(user && userType !== 'captain') && (
                        <TouchableOpacity 
                            style={styles.settingButton}
                            onPress={() => navigation.navigate('FavoriteTour')}
                        >
                            <Text style={styles.settingButtonText}>My Favorites</Text>
                        </TouchableOpacity>
                    )}

                    {/* Past Tours - Herkes görebilir */}
                    {(userType === 'appuser' || userType === 'captain') && (
                        <TouchableOpacity 
                            style={styles.settingButton}
                            onPress={() => navigation.navigate('PastTour', {captainPastTours : allPastTours })}
                        >
                            <Text style={styles.settingButtonText}>Past Tours</Text>
                        </TouchableOpacity>
                    )}

                    {/* Language Settings - Herkes görebilir */}
                    <TouchableOpacity 
                        style={styles.settingButton}
                        onPress={() => setLanguageModalVisible(true)}
                    >
                        <Text style={styles.settingButtonText}>Language Settings</Text>
                    </TouchableOpacity>

                    {/* Notification Settings - Herkes görebilir */}
                    <TouchableOpacity 
                        style={styles.settingButton}
                        onPress={() => setNotificationModalVisible(true)}
                    >
                        <Text style={styles.settingButtonText}>Notification Settings</Text>
                    </TouchableOpacity>

                    {/* Logout - Sadece normal kullanıcı görebilir */}
                    {(userType === 'appuser' || userType === 'captain') && (
                        <TouchableOpacity 
                            style={styles.logoutButton}
                            onPress={handleLogout}
                        >
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* Language Modal */}
            <Modal
                visible={isLanguageModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Language</Text>
                        <TouchableOpacity style={styles.languageOption}>
                            <Text>English</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.languageOption}>
                            <Text>Türkçe</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setLanguageModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Notification Modal */}
            <Modal
                visible={isNotificationModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setNotificationModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Notification Settings</Text>
                        <TouchableOpacity style={styles.notificationOption}>
                            <Text>Tour Updates</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.notificationOption}>
                            <Text>Price Alerts</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.notificationOption}>
                            <Text>New Tours</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setNotificationModalVisible(false)}
                        >
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
    topBar: {
        flexDirection: 'row',
        height: 50,
    },
    titleView: {
        flexDirection : 'row',
        justifyContent : 'center'
    }
    ,
    adView: {
        flex: 1,
        backgroundColor: 'grey',
        justifyContent: 'center',
        alignItems: 'center',
    },
    homeButton: {
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    homeIcon: {
        width: 30,
        height: 30,
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
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
    settingButton: {
        backgroundColor: '#089CFF',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    settingButtonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
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
        marginBottom: 15,
        textAlign: 'center',
    },
    languageOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    notificationOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        backgroundColor: '#089CFF',
        padding: 10,
        borderRadius: 5,
        marginTop: 15,
    },
    closeButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
    },
    logoutButton : {
        backgroundColor : 'red',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent : 'center'
    },
    logoutButtonText : {
        fontSize : 16,
        color : 'white',
        fontWeight : 'bold'
    }
});


