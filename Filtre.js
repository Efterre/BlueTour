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
});