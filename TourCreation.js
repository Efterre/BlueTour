import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { CheckBox } from "react-native-elements";
import MyMap from './maps';


export default function TourCreation({ route , navigation }) {
    const apiurl = "apiurl";
    // State değişkenleri, kullanıcıdan alınacak veriler
    const [tourName, setTourName] = useState('');
    const [selectedTourTypes, setSelectedTourTypes] = useState({
        Daily: true,
        Overnight: false,
        Diving: false,
        Fishing: false,
        Special: false
    });
    const [capacity, setCapacity] = useState('');
    const [isFoodIncluded, setIsFoodIncluded] = useState(false);
    const [foodPricePerPerson, setFoodPricePerPerson] = useState('');
    const [foodPrice, setFoodPrice] = useState('');
    const [countyId, setCountyId] = useState('')
    const { captainId } = route.params;
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null); // Seçilen şehir
    const [counties, setCounties] = useState([]);  
    const [selectedCounty, setSelectedCounty] = useState(null);
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [feeUnit,setFeeUnit] = useState('');
    const isAvaliable = true;
    const [filteredStops, setFilteredStops] = useState([]);
    const [selectedStopIds, setSelectedStopIds] = useState([]);
    const [description, setDescription] = useState('');
    
    // Tur tipi için kapasite ve saat state'lerini ekleyelim
    const [dailyCapacity, setDailyCapacity] = useState('2');
    const [dailyStartTime, setDailyStartTime] = useState('10:00');
    const [dailyEndTime, setDailyEndTime] = useState('18:00');
    const [feeRentTour, setFeeRentTour] = useState('');
    
    const [fishingCapacity, setFishingCapacity] = useState('');
    const [fishingStartTime, setFishingStartTime] = useState('');
    const [fishingEndTime, setFishingEndTime] = useState('');
    const [feePerPersonFishing, setFeePerPersonFishing] = useState('');
    
    const [divingCapacity, setDivingCapacity] = useState('');
    const [divingStartTime, setDivingStartTime] = useState('');
    const [divingEndTime, setDivingEndTime] = useState('');
    const [feePerPersonDiving, setFeePerPersonDiving] = useState('');
    
    const [overnightCapacity, setOvernightCapacity] = useState('');
    const [overnightStartTime, setOvernightStartTime] = useState('');
    const [overnightEndTime, setOvernightEndTime] = useState('');
    const [feeOvernightTour, setFeeOvernightTour] = useState('');
    
    const [specialCapacity, setSpecialCapacity] = useState('');
    const [specialStartTime, setSpecialStartTime] = useState('');
    const [specialEndTime, setSpecialEndTime] = useState('');
    const [feePerHour, setFeePerHour] = useState('');
    
    // Form verilerini tutacak bir state ekleyelim
    const [formData, setFormData] = useState({
        tourName: '',
        selectedTourTypes: {
            Daily: true,
            Overnight: false,
            Diving: false,
            Fishing: false,
            Special: false
        },
        capacity: '',
        feeRentTour: '',
        feePerHour: '',
        feeOvernightTour: '',
        feePerPersonDiving: '',
        feePerPersonFishing: '',
        isFoodIncluded: false,
        foodPricePerPerson: '',
        foodPrice: '',
        feeUnit: '',
        countyId: '',
        selectedCity: null,
        selectedCounty: null,
        description: '',
    });

    // State tanımlamalarına ekleyin
    const [contexts, setContexts] = useState([]);
    const [selectedContextIds, setSelectedContextIds] = useState([]);
    const [isContextModalVisible, setIsContextModalVisible] = useState(false);

    useEffect(() => {
        // Veriyi API'den alacak fonksiyon
        const fetchCities = async () => {
          try {
            const response = await fetch(`${apiurl}/api/allcity`); // API URL'sini buraya yazın
            const data = await response.json();

            setCities(data); // Alınan veriyi cities state'ine ata
          } catch (error) {
            console.error('API Hatası:', error);
          }
        };
        fetchCities(); // useEffect çalıştığında veriyi çek
    }, []); // Boş bağımlılık dizisi, yalnızca bileşen ilk render edildiğinde çalışır
    
    useEffect(() => {
    // Veriyi API'den alacak fonksiyon
        if (selectedCity) {
            const fetchCounties = async () => {
            try {
                const response = await fetch(`${apiurl}/api/allcounty/${selectedCity.id}`); // API URL'sini buraya yazın
                const data = await response.json();

                setCounties(data); // Alınan veriyi cities state'ine ata
            } catch (error) {
                console.error('API Hatası:', error);
            }
            };
            fetchCounties(); // useEffect çalıştığında veriyi çek
        }
    }, [selectedCity]); // Boş bağımlılık dizisi, yalnızca bileşen ilk render edildiğinde çalışır
    
    useEffect(() => {
        const fetchRegistrationNumber = async () => {
            try {
                const response = await fetch(`${apiurl}/api/boat/${captainId}`);
                const data = await response.json();
                
                if (data.rows && data.rows[0] && data.rows[0].registrationnumber) {
                    setRegistrationNumber(data.rows[0].registrationnumber);
                    
                } else {
                    console.error("Registration number not found in response");
                }
            } catch (error) {
                console.error("Error fetching registration number:", error);
            }
        };
        
        // Sadece ilk yüklemede veya haritadan dönüşte registration number'ı yeniden yükle
        if (captainId && (!registrationNumber || route.params?.returnFromMap)) {
            fetchRegistrationNumber();
        }
    }, [captainId, route.params?.returnFromMap]);

    useEffect (() => {
        const fetchFilterStops = async () => {
            try {
                const response = await fetch(`${apiurl}/api/countystops/${countyId}`);
                const data = await response.json();

                setFilteredStops(data);


            } catch (error) {
                console.log("Erol alındı : ", error.message);
            }

        };
        fetchFilterStops();
    }, [countyId])
    
    useEffect(() => {
        if (route.params?.selectedStopIds && route.params?.returnFromMap) {
            setSelectedStopIds(route.params.selectedStopIds);
        }
    }, [route.params?.selectedStopIds, route.params?.returnFromMap]);

    // useEffect ile context'leri çekelim
    useEffect(() => {
        const fetchContexts = async () => {
            try {
                const response = await fetch(`${apiurl}/api/context`);
                if (!response.ok) {
                    throw new Error('Context verileri alınamadı');
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    setContexts(data);
                } else {
                    console.error('Beklenmeyen veri formatı:', data);
                    setContexts([]);
                }
            } catch (error) {
                console.error('Context verileri alınamadı:', error);
                setContexts([]);
            }
        };
        fetchContexts();
    }, []);

    // Form verilerini kaydetme fonksiyonu
    const saveFormData = () => {
        const formData = {
            tourName,
            selectedTourTypes,
            capacity,
            feeRentTour,
            feePerHour,
            feeOvernightTour,
            feePerPersonDiving,
            feePerPersonFishing,
            isFoodIncluded,
            foodPricePerPerson,
            foodPrice,
            feeUnit,
            countyId,
            selectedCity,
            selectedCounty,
            description,
            // Yeni eklenen alanlar
            dailyCapacity,
            dailyStartTime,
            dailyEndTime,
            fishingCapacity,
            fishingStartTime,
            fishingEndTime,
            divingCapacity,
            divingStartTime,
            divingEndTime,
            overnightCapacity,
            overnightStartTime,
            overnightEndTime,
            specialCapacity,
            specialStartTime,
            specialEndTime,
            selectedContextIds,
        };
        navigation.navigate("Mymap", { 
            countyStops: filteredStops,
            captainId: captainId,
            registrationNumber: registrationNumber,
            savedFormData: formData // Form verilerini parametre olarak gönder
        });
    };

    // Form verilerini geri yükleme useEffect'i
    useEffect(() => {
        if (route.params?.savedFormData && route.params?.returnFromMap) {
            const savedData = route.params.savedFormData;
            
            // Tüm form verilerini geri yükle
            setTourName(savedData.tourName);
            setSelectedTourTypes(savedData.selectedTourTypes);
            setCapacity(savedData.capacity);
            setFeeRentTour(savedData.feeRentTour);
            setFeePerHour(savedData.feePerHour);
            setFeeOvernightTour(savedData.feeOvernightTour);
            setFeePerPersonDiving(savedData.feePerPersonDiving);
            setFeePerPersonFishing(savedData.feePerPersonFishing);
            setIsFoodIncluded(savedData.isFoodIncluded);
            setFoodPricePerPerson(savedData.foodPricePerPerson);
            setFoodPrice(savedData.foodPrice);
            setFeeUnit(savedData.feeUnit);
            setCountyId(savedData.countyId);
            setSelectedCity(savedData.selectedCity);
            setSelectedCounty(savedData.selectedCounty);
            setDescription(savedData.description);
            
            // Yeni eklenen alanları geri yükle
            setDailyCapacity(savedData.dailyCapacity);
            setDailyStartTime(savedData.dailyStartTime);
            setDailyEndTime(savedData.dailyEndTime);
            setFishingCapacity(savedData.fishingCapacity);
            setFishingStartTime(savedData.fishingStartTime);
            setFishingEndTime(savedData.fishingEndTime);
            setDivingCapacity(savedData.divingCapacity);
            setDivingStartTime(savedData.divingStartTime);
            setDivingEndTime(savedData.divingEndTime);
            setOvernightCapacity(savedData.overnightCapacity);
            setOvernightStartTime(savedData.overnightStartTime);
            setOvernightEndTime(savedData.overnightEndTime);
            setSpecialCapacity(savedData.specialCapacity);
            setSpecialStartTime(savedData.specialStartTime);
            setSpecialEndTime(savedData.specialEndTime);
            setSelectedContextIds(savedData.selectedContextIds);
        }
    }, [route.params?.savedFormData, route.params?.returnFromMap]);

    // Select Stop butonuna tıklandığında form verilerini kaydet
    const handleSelectStop = () => {
        saveFormData();
    };

    // Turu kaydetme fonksiyonu
    const handleCreateTour = async () => {
        if (!registrationNumber) {
            alert('Tekne kayıt numarası bulunamadı!');
            return;
        }

        if (description && description.length > 250) {
            alert('Açıklama en fazla 250 karakter olabilir!');
            return;
        }

        try {
            // Önce turu ekleyelim
            const tourResponse = await fetch(`${apiurl}/api/addtour`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    boatregistrationnumber: registrationNumber,
                    tourname: tourName,
                    isdivingtour: selectedTourTypes.Diving,
                    isfishingtour: selectedTourTypes.Fishing,
                    isdailytour: selectedTourTypes.Daily,
                    isovernighttour: selectedTourTypes.Overnight,
                    isspecialtour: selectedTourTypes.Special,
                    capacity : capacity,
                    foodstate: isFoodIncluded,
                    isavaliable: isAvaliable,
                    foodpriceperperson: foodPricePerPerson || null,
                    foodprice: foodPrice || null,
                    feeunit: feeUnit || "TRY",
                    countyid: countyId,
                    description: description.trim() || null,
                    // Yeni eklenen alanlar
                    dailycapacity: dailyCapacity || null,
                    dailystarttime: dailyStartTime || null,
                    dailyendtime: dailyEndTime || null,
                    feerenttour: feeRentTour || null,
                    fishingcapacity: fishingCapacity || null,
                    fishingstarttime: fishingStartTime || null,
                    fishingendtime: fishingEndTime || null,
                    feefishingtour: feePerPersonFishing || null,
                    divingcapacity: divingCapacity || null,
                    divingstarttime: divingStartTime || null,
                    divingendtime: divingEndTime || null,
                    feedivingtour: feePerPersonDiving || null,
                    overnightcapacity: overnightCapacity || null,
                    overnightstarttime: overnightStartTime || null,
                    overnightendtime: overnightEndTime || null,
                    feeovernighttour: feeOvernightTour || null,
                    specialcapacity: specialCapacity || null,
                    specialstarttime: specialStartTime || null,
                    specialendtime: specialEndTime || null,
                    feeperhour: feePerHour || null,
                    selectedContextIds: selectedContextIds,
                }),
            });

            console.log("tresponse : ", tourResponse);

            if (tourResponse.ok) {
                // Tur başarıyla eklendiyse ve seçili duraklar varsa
                if (selectedStopIds && selectedStopIds.length > 0) {
                    // Durakları ekleyelim
                    const stopsResponse = await fetch(`${apiurl}/api/addtourstops/${registrationNumber}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            allstopid: selectedStopIds
                        }),
                    });

                    if (!stopsResponse.ok) {
                        console.error('Duraklar eklenirken hata oluştu');
                        alert('Tur oluşturuldu fakat duraklar eklenirken bir hata oluştu.');
                        navigation.navigate('CaptainHome', { captainId: captainId });
                        return;
                    }
                }

                alert('Tur ve duraklar başarıyla kaydedildi!');
                navigation.navigate('CaptainHome', { captainId: captainId });
            } else {
                const errorData = await tourResponse.json();
                alert(`Tur kaydında bir sorun oluştu: ${errorData.error || 'Bilinmeyen hata'}`);
            }
        } catch (error) {
            console.error('Kayıt hatası:', error);
            alert('Kayıt sırasında bir hata oluştu.');
        }
    };
    
    const toggleSelectionTourType = (type) => {
        setSelectedTourTypes((prev) => {
            const selectedCount = Object.values(prev).filter(Boolean).length; // true olanları say
        
            // Eğer sadece 1 tane seçili varsa ve kullanıcı onu kaldırmaya çalışıyorsa işlemi engelle
            if (selectedCount === 1 && prev[type]) {
                return prev;
            }
            
            return {
                ...prev,
                [type]: !prev[type], // Seçiliyse kaldır, seçili değilse ekle
            }
        });
    };

    // Context seçimi için modal komponenti
    const ContextSelectionModal = () => (
        <Modal
            visible={isContextModalVisible}
            animationType="slide"
            transparent={true}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Tur İçeriklerini Seçin</Text>
                    <ScrollView>
                        {contexts && contexts.length > 0 ? (
                            contexts.map(context => (
                                <TouchableOpacity
                                    key={context.id}
                                    style={[
                                        styles.contextItem,
                                        selectedContextIds.includes(context.id) && styles.selectedContextItem
                                    ]}
                                    onPress={() => {
                                        setSelectedContextIds(prev => 
                                            prev.includes(context.id)
                                                ? prev.filter(id => id !== context.id)
                                                : [...prev, context.id]
                                        );
                                    }}
                                >
                                    <Text style={styles.contextName}>{context.name}</Text>
                                    {selectedContextIds.includes(context.id) && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.noContextText}>Yüklenirken...</Text>
                        )}
                    </ScrollView>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setIsContextModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>İptal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.saveButton]}
                            onPress={() => {
                                setIsContextModalVisible(false);
                            }}
                        >
                            <Text style={styles.buttonText}>Kaydet</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.formContainer}>

                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('CaptainHome', { userType: 1, captainId: captainId })}>
                        <Text style={styles.backButtonText}>{"< Back"}</Text>
                    </TouchableOpacity>

                    <Text style={styles.title}>Yeni Tur Oluştur</Text>
                    <Text>                      </Text>
                </View>
                
                {/* Tur Adı */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Tur Adi</Text>
                    <TextInput
                        style={styles.input}
                        value={tourName}
                        onChangeText={setTourName}
                        placeholder="Tur Adını Girin"
                    />
                </View>

                {/* Tur Açıklaması */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Tur Açıklaması (Maksimum 250 karakter)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={(text) => {
                            if (text.length <= 250) {
                                setDescription(text);
                            }
                        }}
                        placeholder="Tur hakkında kısa bir açıklama girin"
                        multiline
                        numberOfLines={4}
                        maxLength={250}
                    />
                    <Text style={styles.characterCount}>
                        {description.length}/250 karakter
                    </Text>
                </View>

                {/* Checkboc'lu tourtype */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Tur Tipi    <Text style={{ fontStyle: 'italic' }}>(Birden fazla seçilebilir)</Text></Text>
                    {Object.keys(selectedTourTypes).map((type) => (
                        <View key={type} style={styles.checkboxContainer}>
                            <CheckBox
                                title={type}
                                checked={selectedTourTypes[type]}
                                onPress={() => toggleSelectionTourType(type)}
                            />
                        </View>
                    ))}
                </View>

                {/* Konum */}
                <View style={styles.locationContainer}>
                    <Text style={styles.locationTitle}>Konum Seçimi</Text>

                    {/* City seçimi */}
                    <Text style={styles.label}>Şehir Seçin</Text>
                    <Picker
                        selectedValue={selectedCity ? selectedCity.id : ""}
                        onValueChange={(itemValue) => {
                            const city = cities.find(city => city.id === itemValue);
                            setSelectedCity(city || null);
                        }}
                        style={[styles.locationPicker]}  // Görünürlüğü kontrol etmek için
                    >
                        <Picker.Item label="Şehir Seçin" value="" />
                        {cities.map(city => (
                            <Picker.Item key={city.id} label={city.name} value={city.id} />
                        ))}
                    </Picker>

                    {/* County seçimi */}
                    {selectedCity && (
                        <>
                            <Text style={styles.label}>İlçe Seçin</Text>
                            <Picker
                                selectedValue={selectedCounty ? selectedCounty.id : ""} 
                                onValueChange={(itemValue) => {
                                    const county = counties.find(county => county.id === itemValue);
                                    setSelectedCounty(county || null); // Seçilen ilçeyi state'e kaydediyoruz
                                    setCountyId(itemValue); // Seçilen ilçenin id'sini kaydediyoruz
                                }}
                                style={styles.locationPicker}
                            >
                                <Picker.Item label="İlçe Seçin" value="" />
                                {counties.map(county => (
                                    <Picker.Item key={county.id} label={county.name} value={county.id} />
                                ))}
                            </Picker>
                        </>
                    )}

                    {/* County seçimi */}
                    {countyId && (
                        <>
                            <Text style={styles.label}>Gidilen Duraklama Noktaları</Text>
                            <TouchableOpacity 
                                style={styles.button} 
                                onPress={handleSelectStop}
                            >
                                <Text style={styles.buttonText}>Select Stop</Text>
                            </TouchableOpacity>
                                
                            {/* Seçili durakları göster */}
                            {selectedStopIds.length > 0 && (
                                <View style={styles.selectedStopsContainer}>
                                    <Text style={styles.label}>Seçili Durak Sayısı: {selectedStopIds.length}</Text>
                                </View>
                            )}
                        </>
                    )}

                </View>

                {/* Kapasite */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Kapasite</Text>
                    <Picker
                        selectedValue={capacity}
                        onValueChange={(value) => setCapacity(value)}
                        style={{...styles.input, paddingVertical: 25}}
                    >
                        <Picker.Item label="2" value="2" />
                        <Picker.Item label="3" value="3" />
                        <Picker.Item label="4" value="4" />
                        <Picker.Item label="5" value="5" />
                        <Picker.Item label="6" value="6" />
                        <Picker.Item label="7" value="7" />
                        <Picker.Item label="8" value="8" />
                        <Picker.Item label="9" value="9" />
                        <Picker.Item label="10" value="10" />
                        <Picker.Item label="11" value="11" />
                        <Picker.Item label="12" value="12" />
                        <Picker.Item label="12-18 Kişi" value="18" />
                        <Picker.Item label="19-24 Kişi" value="24" />
                        <Picker.Item label="25-36 Kişi" value="36" />
                        <Picker.Item label="37-50 Kişi" value="50" />
                        <Picker.Item label="51+ Kişi" value="51" />

                    </Picker>
                </View>

                {selectedTourTypes.Daily && (
                    <>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Daily Tour Kapasite</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={dailyCapacity}
                                onChangeText={setDailyCapacity}
                                placeholder="2"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Daily Tour Başlangıç Saati</Text>
                            <TextInput
                                style={styles.input}
                                value={dailyStartTime}
                                onChangeText={setDailyStartTime}
                                placeholder="09:00"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Daily Tour Bitiş Saati</Text>
                            <TextInput
                                style={styles.input}
                                value={dailyEndTime}
                                onChangeText={setDailyEndTime}
                                placeholder="17:00"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Daily Tour Ücreti</Text>
                            <TextInput
                                style={styles.input}
                                value={feeRentTour}
                                onChangeText={setFeeRentTour}
                            />
                        </View>
                    </>
                )}
                
                {/* saatlik tur Ücret */}
                {selectedTourTypes.Special && (
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Hourly Ücret for special tour</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={feePerHour}
                        onChangeText={setFeePerHour}
                        placeholder="Special Tur için saatlik Ücreti Girin"
                    />
                </View>
                )}

                {/* kişi başı Ücret */}
                {selectedTourTypes.Fishing && (
                    <>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Fishing Tour Kapasite</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={fishingCapacity}
                                onChangeText={setFishingCapacity}
                                placeholder="Balık Tutma Turu Kapasitesi"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Fishing Tour Başlangıç Saati</Text>
                            <TextInput
                                style={styles.input}
                                value={fishingStartTime}
                                onChangeText={setFishingStartTime}
                                placeholder="05:00"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Fishing Tour Bitiş Saati</Text>
                            <TextInput
                                style={styles.input}
                                value={fishingEndTime}
                                onChangeText={setFishingEndTime}
                                placeholder="12:00"
                            />
                        </View>
                </>
                )}

                {/* kişi başı Ücret */}
                {selectedTourTypes.Diving && (
                    <>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Diving Tour Kapasite</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={divingCapacity}
                                onChangeText={setDivingCapacity}
                                placeholder="Dalış Turu Kapasitesi"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Diving Tour Başlangıç Saati</Text>
                            <TextInput
                                style={styles.input}
                                value={divingStartTime}
                                onChangeText={setDivingStartTime}
                                placeholder="08:00"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Diving Tour Bitiş Saati</Text>
                            <TextInput
                                style={styles.input}
                                value={divingEndTime}
                                onChangeText={setDivingEndTime}
                                placeholder="16:00"
                            />
                        </View>
                    </>
                )}

                {/* kişi başı Ücret */}
                {selectedTourTypes.Overnight && (
                    <>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Overnight Tour Kapasite</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={overnightCapacity}
                                onChangeText={setOvernightCapacity}
                                placeholder="Overnight Turu Kapasitesi"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Overnight Tour Başlangıç Saati</Text>
                            <TextInput
                                style={styles.input}
                                value={overnightStartTime}
                                onChangeText={setOvernightStartTime}
                                placeholder="05:00"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Overnight Tour Bitiş Saati</Text>
                            <TextInput
                                style={styles.input}
                                value={overnightEndTime}
                                onChangeText={setOvernightEndTime}
                                placeholder="12:00"
                            />
                        </View>
                    </>
                )}

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Para Birimi</Text>
                    <Picker
                        selectedValue={feeUnit || "TRY"} f
                        onValueChange={(value) => setFeeUnit(value)}
                        style={{...styles.input, paddingVertical: 25}}
                    >
                        <Picker.Item label="TRY" value="TRY" />
                        <Picker.Item label="USD" value="USD" />
                        <Picker.Item label="EUR" value="EUR" />
                    </Picker>
                </View>

                {/* Yiyecek Dahil Mi? */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Yiyecek Opsiyonel Mi?</Text>
                    <Picker
                        selectedValue={isFoodIncluded}
                        onValueChange={(itemValue) => setIsFoodIncluded(itemValue)}
                        style={{...styles.input, paddingVertical: 25}}
                    >
                        <Picker.Item label="Hayır" value={false} />
                        <Picker.Item label="Evet" value={true} />
                    </Picker>
                </View>

                {isFoodIncluded && (
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Kişi Başı Yemek Ücreti</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={foodPricePerPerson}
                        onChangeText={setFoodPricePerPerson}
                        placeholder="Kişi Başı Yemek Ücreti Girin"
                    />
                </View>
                )}


                {isFoodIncluded && (
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Yemek Ücreti</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={foodPrice}
                        onChangeText={setFoodPrice}
                        placeholder="Yemek Ücreti Girin"
                    />
                </View>
                )}

                {/* Tur İçerikleri */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Tur İçerikleri</Text>
                    <TouchableOpacity
                        style={styles.contextButton}
                        onPress={() => setIsContextModalVisible(true)}
                    >
                        <Text style={styles.contextButtonText}>
                            {selectedContextIds.length > 0 
                                ? `${selectedContextIds.length} içerik seçildi`
                                : 'İçerik Seç'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Kaydet Butonu */}
                <TouchableOpacity style={styles.button} onPress={handleCreateTour}>
                    <Text style={styles.buttonText}>Tur Oluştur</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Modal bileşenini ekleyin */}
            <ContextSelectionModal />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    formContainer: {
        padding: 18,
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: 'row', // Yatayda hizalama
        justifyContent: 'space-between', // İki eleman arasına boşluk bırakma
        alignItems: 'flex-start', // Yükseklik boyunca ortalama
        width: '100%', // Tam genişlik
        marginBottom: 10, // Başlık ile form arasına boşluk ekleyelim
    },    
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20, // Daha fazla boşluk ekleyerek inputlar arasındaki mesafeyi artırıyoruz
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    input: {
        height: 45, // Daha büyük input alanı
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 5,
        fontSize: 16, // Input içeriği daha okunaklı olsun
    },
    picker: {
        height: 45, // Picker'ların daha rahat görünmesi için boyut arttırıldı
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginTop: 20, // Buton ile form arasına boşluk ekleyin
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        margin: 5,
        padding: 5,
        backgroundColor: '#f1f1f1',
        borderRadius: 5,
    },
    backButtonText: {
        fontSize: 18,
        color: '#007bff',
    },
    locationContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30, // Üstten padding ekleyerek daha düzgün hizalama
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        width : '100%'
    },
    locationTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    label: {
        fontSize: 18,
        fontWeight: '500',
        color: '#444',
        marginVertical: 12,
    },
    locationPicker: {
        height: 50,
        width: '100%',
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    selectedStopsContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        alignItems: 'center',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 10,
    },
    characterCount: {
        textAlign: 'right',
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    contextItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedContextItem: {
        backgroundColor: '#e8f4ff',
    },
    contextName: {
        fontSize: 16,
    },
    checkmark: {
        color: '#4CAF50',
        fontSize: 18,
    },
    contextButton: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    contextButtonText: {
        fontSize: 16,
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 5,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ff6b6b',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    noContextText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 10,
    },
});

