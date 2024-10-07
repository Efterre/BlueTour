import React, { Component, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';

class Filtre extends Component {
    state = {
        filtreMarks : {
            location : '',
            tourType : '',
            boatType : '',
            capacity : '',
            foodSituation : '',
            stopCount : '',
            startDate : '',
            endDate : '',
            fee : '',
            isAvailable : true
        }
    }

    handleLocation = (locationInput) => {
        this.setState({filtreMarks:({location: locationInput})})
    }
    handleTourType = (tourTypeInput) => {
        this.setState({filtreMarks:({tourType: tourTypeInput})})
    }
    handleBoatType = (boatTypeInput) => {
        this.setState({filtreMarks:})  
    }
    handleCapacity = (capacityInput) => {
        this.filtreMarks({capacity: capacityInput})
    }
    handleFoodSituation = (foodSituationInput) => {
        this.filtreMarks({foodSituation: foodSituationInput})
    }
    handleStopCount = (stopsInput) => {
        this.filtreMarks({stopCount: stopsInput})
    }
    handleStartDate = (startDateInput) => {
        this.filtreMarks({startDate: startDateInput})
    }
    handleEndDate = (endDateInput) => {
        this.filtreMarks({endDate: endDateInput})
    }
    handleFee = (feeInput) => {
        this.filtreMarks({fee: feeInput})
    }
    handleIsAvailable = (isAvailableInput) => {
        this.filtreMarks({isAvailable: isAvailableInput})
    }

    render() {
        return (
            <ScrollView style= {styles.ScrollViewContainer}>
                
            </ScrollView>
        );
    }


}

export default Filtre;

const styles = StyleSheet.create ({
    ScrollViewContainer : {
        backgroundColor : 'black'
    }
})