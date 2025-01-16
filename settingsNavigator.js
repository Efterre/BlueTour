import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native'; 
import Settings from './settings'; 

const SettingsModal = ({ visible, toggleModal }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={toggleModal}
        >
            <View style={styles.settingsModalContainer}>
                <View style={styles.settingsModalContent}>
                    <Text style={styles.settingsModalTitle}>Settings</Text>
                    <Settings />
                    <TouchableOpacity onPress={toggleModal} style={styles.closeSettingsModalButton}>
                        <Text style={styles.closeSettingsModalButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({

});

export default SettingsModal;