import { Image, StyleSheet, Platform , Text , View , Button , ScrollView , TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import React , {Component, useState} from 'react';
import LogIn from './LogIn';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
    const [isModalVisible, setModalVisible] = useState(false);

    const openModal = () => setModalVisible(true);  // Modal açma fonksiyonu
    const closeModal = () => setModalVisible(false); // Modal kapatma fonksiyonu
  

    
    return (
        <SafeAreaView>
            <View>
                <Button title="Log In" onPress={openModal} />
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={closeModal} 
                >
                    <View style={styles.modalContainer}>
                        <LogIn closeModal={closeModal} /> 
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    modalContainer:{
        flex: 1,
        backgroundColor: 'rgb(255, 255, 255)', // Arka planı saydam yapıyoruz
    },
});


