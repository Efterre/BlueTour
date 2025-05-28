import React , {useState , useRef, useEffect} from 'react';
import { StyleSheet, Image, Platform , Text, View, TouchableOpacity , TextInput, Modal } from 'react-native';
import Filtre from './Filtre';
import Map from './maps';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useNavigation } from '@react-navigation/native';

export default function Boats({ onFiltreViewChange }) { 
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedCounty, setSelectedCounty] = useState(null);
    const [countyStops, setCountyStops] = useState([]);
    const [filtreView, setFiltreView] = useState(false);
    const [currentFilters, setCurrentFilters] = useState(null);
    const apiurl = "apiurl";
    const filtreRef = useRef(null);
    const navigation = useNavigation();
    const [filteredTourIds, setFilteredTourIds] = useState([]);
    const [searchedTourIds, setSearchedTourIds] = useState([]);

    const resetFilters = () => {
        if (filtreRef.current) {
            filtreRef.current.clearFilter();
        }
        setCurrentFilters(null);
        setFiltreView(false);
        setSearchText('');
        setSearchedTourIds([]);
        if (onFiltreViewChange) {
            onFiltreViewChange(false, []);
        }
    };

    const toggleFiltreModal = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    const toggleFiltreView = () => {
        // HomeScreen'e bildir
        if (onFiltreViewChange) {
            onFiltreViewChange(filtreView, filteredTourIds);
        }
    };


    const handleSearch = async () => {
        if (!searchText.trim()) {
            console.log('Arama metni boş, API çağrısı yapılmadı');
            onFiltreViewChange(false, []);
            return;
        }

        try {
            const response = await fetch(`${apiurl}/api/search-boats?search=${encodeURIComponent(searchText)}`);
            const tourIds = await response.json();
            setSearchedTourIds(tourIds);
            // Parent component'e arama sonuçlarını bildir
            if (onFiltreViewChange) {
                onFiltreViewChange(true, tourIds);
            }
        } catch (error) {
            console.error('Arama sırasında hata oluştu:', error);
        }
    };

    const fetchCountyStops = async (countyId) => {
        try {
            const response = await fetch(`${apiurl}/api/countystops/${countyId}`);
            const data = await response.json();
            setCountyStops(data);
        } catch (error) {
            console.error("Error fetching stops:", error);
        }
    };

    useEffect(() => {
        // Varsayılan olarak Ayvalık'ın duraklarını getirelim (örnek olarak)
        fetchCountyStops(1); // 1 yerine varsayılan bir ilçe ID'si kullanın
    }, []);

    const openMapModal = () => {
        if (countyStops.length > 0) {
            setMapModalVisible(true);
        } else {
            alert("Duraklar yüklenirken bir hata oluştu.");
        }
    };

    const handleFiltersChange = async (newFilters) => {
        setCurrentFilters(newFilters);
        try {
            const tourIds = await filtreRef.current.applyFilters();
            setFilteredTourIds(tourIds);
            // HomeScreen'e bildir
            if (onFiltreViewChange) {
                onFiltreViewChange(true, tourIds);
            }
        } catch (error) {
            console.error('Filtreleme hatası:', error);
        }
    };

    // filtreView değiştiğinde parent component'e bildir
    useEffect(() => {
        if (onFiltreViewChange) {
            onFiltreViewChange(filtreView);
        }
    }, [filtreView]);

    const handleMapSelection = (selectedStops) => {
        if (filtreRef.current) {
            const currentFilters = filtreRef.current.getCurrentFilters();
            const updatedFilters = {
                ...currentFilters,
                stops: selectedStops.map(stop => stop.id)
            };
            filtreRef.current.setFilters(updatedFilters);
        }
    };

    return (
        <SafeAreaView style={styles.safeAreaExplore}>
            <View style={styles.header}>
                <View style={styles.searchBar}> 
                    <TouchableOpacity onPress={() => {
                        toggleFiltreModal();
                    }}>
                        <Image 
                            source={require('./assets/images/filter-list.png')} 
                            style={styles.searchBarIcon}
                        />
                    </TouchableOpacity>
                    
                    <TextInput
                        style={styles.searchInput}
                        placeholder='Type Tour Name'
                        value={searchText}
                        onChangeText={setSearchText}
                    />

                    <TouchableOpacity
                        style={styles.locationSearchBar}
                        onPress={openMapModal}
                    >
                        <Text>Customize</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSearch}>
                        <Image 
                            source={require('./assets/images/search.png')} 
                            style={styles.searchBarIcon}
                        />
                    </TouchableOpacity>
                </View>

                {/* Harita Modalı */}
                <Modal
                    visible={mapModalVisible}
                    animationType="slide"
                    transparent={false}
                    onRequestClose={() => setMapModalVisible(false)}
                >
                    <View style={styles.mapModalContainer}>
                        <TouchableOpacity
                            style={styles.closeMapButton}
                            onPress={() => setMapModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Haritayı Kapat</Text>
                        </TouchableOpacity>
                        
                        <Map 
                            route={{ 
                                params: { 
                                    countyStops: countyStops,
                                    isFilterMode: true,
                                    onStopsSelected: handleMapSelection
                                }
                            }}
                            navigation={navigation}
                        />
                    </View>
                </Modal>

                {/* Filtre Modalı */}
                <Modal
                    visible={isFilterVisible}
                    animationType="slide"
                    transparent={false}
                    onRequestClose={toggleFiltreModal}
                >
                    <View style={styles.fullScreenModal}>
                        <View style={styles.filtreTopBar}>  
                            <TouchableOpacity 
                                onPress={() => {
                                    toggleFiltreModal();
                                    toggleFiltreView();
                                }} 
                                style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.filtreContent}>
                            <Filtre 
                                ref={filtreRef}
                                initialFilters={currentFilters}
                                onFiltersChange={handleFiltersChange}
                            />
                        </View>

                        <View style={styles.filtreBottomBar}>
                            <TouchableOpacity 
                                style={styles.applyButtonOnFiltre}
                                onPress={() => {
                                    toggleFiltreModal();
                                    setFiltreView(true);
                                }}
                            >
                                <Text style={styles.buttonText}>Uygula</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.clearButtonOnFiltre} 
                                onPress={resetFilters}
                            >
                                <Text style={styles.buttonText}>Temizle</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeAreaExplore: {
        flex: 1,
        backgroundColor: '#F5F9FF'
    },
    header: {
        flex: 0.1,
        backgroundColor: 'white',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginVertical: 8,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchBarIcon: {
        width: 24,
        height: 24,
        margin: 8,
        tintColor: '#17A2B8'
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: '#17A2B8',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 15,
        color: '#2C3E50'
    },
    locationSearchBar: {
        padding: 10,
        margin: 4,
        backgroundColor: '#17A2B8',
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    mapModalContainer: {
        flex: 1,
        backgroundColor: '#F5F9FF'
    },
    closeMapButton: {
        position: 'absolute',
        top: 30,
        alignSelf: 'center',
        backgroundColor: '#17A2B8',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 10
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    fullScreenModal: {
        flex: 1,
        backgroundColor: '#F5F9FF',
    },
    filtreContent: {
        flex: 1,
        marginBottom: 70, // Alt butonlar için boşluk
    },
    filtreTopBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 15,
        backgroundColor: '#1E3D59',
        borderBottomWidth: 1,
        borderBottomColor: '#17A2B8',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    filtreBottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#1E3D59',
        borderTopWidth: 1,
        borderTopColor: '#17A2B8',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    applyButtonOnFiltre: {
        backgroundColor: '#17A2B8',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        flex: 1,
        marginRight: 10,
    },
    clearButtonOnFiltre: {
        backgroundColor: '#FF6B6B',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        flex: 1,
        marginLeft: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: '#FF6B6B',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    body: {
        flex: 0.9,
        backgroundColor: '#F5F9FF'
    }
});
