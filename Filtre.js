<<<<<<< HEAD
import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Modal, FlatList } from 'react-native';

const Filtre = forwardRef(({ initialFilters, onFiltersChange }, ref) => {
    const apiurl = "http://192.168.1.100:5000";
    const [filtreMarks, setFiltreMarks] = useState({
        city: [],
        county: [],
        tourType: [],
        boatType: [],
        context: [],
        capacity: [],
        foodSituation: [],
        date: [],
        stops: [],
        ...initialFilters
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [currentFilter, setCurrentFilter] = useState('');
    const [options, setOptions] = useState([]);
    const [filterOptions, setFilterOptions] = useState(null); 

    useImperativeHandle(ref, () => ({
        clearFilter: async () => {
            const emptyFilters = {
                city: [],
                county: [],
                tourType: [],
                boatType: [],
                context: [],
                capacity: [],
                foodSituation: [],
                date: [],
                stops: []
            };

            // State'i güncelle
            setFiltreMarks(emptyFilters);

            // State güncellemesinin tamamlanmasını bekle
            await new Promise(resolve => setTimeout(resolve, 0));

            // Parent component'e bildir
            if (onFiltersChange) {
                onFiltersChange(emptyFilters);
            }
        },
        applyFilters: async () => {
            try {
                // State'in güncellenmesini bekle
                await new Promise(resolve => setTimeout(resolve, 0));
                
                const currentFilters = { ...filtreMarks };
                
                const response = await fetch(`${apiurl}/api/filter-tours`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(currentFilters)
                });
                
                const tourIds = await response.json();
                return tourIds;
            } catch (error) {
                console.error('Filtreleme hatası:', error);
                throw error;
            }
        }
    }), [filtreMarks, onFiltersChange]);

    const fetchFilterOptions = async () => {
        try {
            const response = await fetch(`${apiurl}/api/filter-options`);
            const data = await response.json();
            setFilterOptions(data);
        } catch (error) {
            console.error("Filtre verileri alınamadı", error);
        }
    };

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        if (initialFilters) {
            setFiltreMarks(prev => ({
                ...prev,
                ...initialFilters
            }));
        }
    }, [initialFilters]);

    const openModal = (filter) => {
        setModalVisible(true);
        setCurrentFilter(filter);
        if (filterOptions && filterOptions[filter]) {
            setOptions(filterOptions[filter]);
        }
    };

    const toggleSelection = (item) => {
        setFiltreMarks(prevMarks => {
            const selectedItems = prevMarks[currentFilter] || [];
            let newSelectedItems;
            
            if (selectedItems.includes(item)) {
                newSelectedItems = selectedItems.filter(i => i !== item);
            } else {
                newSelectedItems = [...selectedItems, item];
            }

            const newMarks = {
                ...prevMarks,
                [currentFilter]: newSelectedItems
            };

            setTimeout(() => {
                if (onFiltersChange) {
                    onFiltersChange(newMarks);
                }
            }, 0);

            return newMarks;
        });
    };

    return (
        <ScrollView style={styles.ScrollViewContainer}>
            {filterOptions && Object.keys(filterOptions).map((filter) => (
                <View style={styles.inputView} key={filter}>
                    <Text style={styles.filtreSteps}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</Text>
                    <TouchableOpacity onPress={() => openModal(filter)}>
                        <TextInput
                            style={styles.input}
                            placeholder={`Select ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
                            value={(filtreMarks[filter] || []).join(', ')}
                            editable={false}
                        />
                    </TouchableOpacity>
                </View>
            ))}

            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => toggleSelection(item)}>
                                <View style={styles.optionContainer}>
                                    <Text style={styles.optionText}>{item}</Text>
                                    {(filtreMarks[currentFilter] || []).includes(item) && <Text style={styles.selectedText}>✓</Text>}
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </ScrollView>
    );
});

export default Filtre;

const styles = StyleSheet.create({
    ScrollViewContainer: {
        flex: 1,
        backgroundColor: '#F5F9FF',
        padding: 15,
        paddingBottom: 80, // Alt butonlar için boşluk bırakıyoruz
    },
    inputView: {
        marginBottom: 15,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    filtreSteps: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E3D59',
        marginBottom: 8,
        textTransform: 'capitalize',
    },
    input: {
        borderWidth: 1,
        borderColor: '#17A2B8',
        borderRadius: 8,
        padding: 12,
        backgroundColor: 'white',
        fontSize: 15,
        color: '#2C3E50',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(30, 61, 89, 0.8)',
        padding: 20,
    },
    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        marginVertical: 6,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    optionText: {
        fontSize: 16,
        color: '#2C3E50',
        fontWeight: '500',
    },
    selectedText: {
        fontSize: 18,
        color: '#17A2B8',
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 15,
        backgroundColor: '#17A2B8',
        alignItems: 'center',
        borderRadius: 25,
        marginTop: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
=======
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Modal, FlatList } from 'react-native';

class Filtre extends Component {
    state = {
        filtreMarks: {
            city: [],
            county: [],
            tourType: [],
            boatType: [],
            capacity: [],
            foodSituation: [],
            stopCount: [],
            startDate: '',
            endDate: '',
            fee: '',
            isAvailable: true
        },
        modalVisible: false,
        currentFilter: '',
        options: [],
    }

    clearFilter = () => {
        this.setState({
            filtreMarks: {
                city: [],
                county: [],
                tourType: [],
                boatType: [],
                capacity: [],
                foodSituation: [],
                stopCount: [],
                startDate: '',
                endDate: '',
                fee: '',
                isAvailable: true
            }
        });
    }

    // Örnek veri
    filterOptions = {
        city: ['Istanbul', 'Ankara', 'Izmir'],  // db'deki location'ı select distinct ile alıp buraya liste içine al
        county: ['County1', 'County2', 'County3'], // db'deki location'ı select distinct where county.city = city.cityID ile alıp buraya liste içine al
        tourType: ['Daily', 'Fishing', 'Boarding'], // db'deki tourType'ı'ı select distinct ile alıp buraya liste içine al
        boatType: ['Boat1', 'Boat2', 'Boat3'], // db'deki boatType'ı select distinct ile alıp buraya liste içine al
        capacity: ['1-2', '3-4', '5-6'],
        foodSituation: ['Included', 'Not Included'], // true or false 1 or 0
        stopCount: ['1', '2', '3','4'], 
        
    };

    openModal = (filter) => {
        this.setState({
            modalVisible: true,
            currentFilter: filter,
            options: this.filterOptions[filter],
        });
    }

    toggleSelection = (item) => {
        const { currentFilter, filtreMarks } = this.state;
        const selectedItems = filtreMarks[currentFilter];

        if (selectedItems.includes(item)) {
            this.setState({
                filtreMarks: {
                    ...filtreMarks,
                    [currentFilter]: selectedItems.filter(i => i !== item)
                }
            });
        } else {
            this.setState({
                filtreMarks: {
                    ...filtreMarks,
                    [currentFilter]: [...selectedItems, item]
                }
            });
        }
    }

    render() {
        const { filtreMarks, modalVisible, currentFilter, options } = this.state;

        return (
            <ScrollView style={styles.ScrollViewContainer}>
                {Object.keys(this.filterOptions).map((filter) => (
                    <View style={styles.inputView} key={filter}>
                        <Text style={styles.filtreSteps}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</Text>
                        <TouchableOpacity onPress={() => this.openModal(filter)}>
                            <TextInput
                                style={styles.input}
                                placeholder={`Select ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
                                value={filtreMarks[filter].join(', ')}
                                editable={false}
                            />
                        </TouchableOpacity>
                    </View>
                ))}

                <Modal
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => this.setState({ modalVisible: false })}
                >
                    <View style={styles.modalContainer}>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => this.toggleSelection(item)}>
                                    <View style={styles.optionContainer}>
                                        <Text style={styles.optionText}>{item}</Text>
                                        {filtreMarks[currentFilter].includes(item) && <Text style={styles.selectedText}>✓</Text>}
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity onPress={() => this.setState({ modalVisible: false })} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

export default Filtre;

const styles = StyleSheet.create({
    ScrollViewContainer: {
        backgroundColor: 'black',
    },
    inputView: {
        padding: 5,
        backgroundColor: 'lightblue',
    },
    input: {
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 5,
        padding: 8,
        backgroundColor: '#f9f9f9',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: 'white',
        marginVertical: 5,
        borderRadius: 5,
    },
    optionText: {
        fontSize: 16,
    },
    selectedText: {
        fontSize: 16,
        color: 'green',
    },
    closeButton: {
        padding: 10,
        backgroundColor: 'blue',
        alignItems: 'center',
        borderRadius: 5,
        margin: 20,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 18,
    },
>>>>>>> 1cb0f61753bad1140174d9777c72c9ea3969fc55
});