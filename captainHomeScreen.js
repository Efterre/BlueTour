import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Image, Modal, TextInput } from 'react-native';
import React, { useState, useEffect , useCallback} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export default function CaptainHomeScreen({ 
  route = { params: { userType: 1, captainId: null } }, 
  navigation 
}) {
  const apiurl = "apiurl";
  const [modalVisible, setModalVisible] = useState(false);
  const [newTour, setNewTour] = useState({ type: '', capacity: '', stops: [], price: '', date: '', isfoodinclude: false });
  const [selectedStops, setSelectedStops] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const { userType, captainId } = route.params;
  const [captainTourName, setTourname] = useState('');
  const today = new Date().toLocaleDateString('tr-TR'); 
  const dayOfWeek = today.toLocaleString('tr-TR', { weekday: 'long' });
  const [futureRezervs, setFutureRezervs] = useState([]);
  const [selectedRezervation, setSelectedRezervation] = useState(null);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [tourtype, setTourType] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedTourType, setSelectedTourType] = useState("");
  const [foodChoice, setFoodChoice] = useState(false);
  const [bookdates , setBookedDates] = useState([]);

  useEffect(() => {
    if (userType === 'captain') {
      navigation.replace('CaptainHome');
    }
  }, [userType]);

  useEffect(() => {
    // Eğer captainId yoksa AsyncStorage'dan almayı deneyelim
    const loadCaptainId = async () => {
      try {
        const sessionData = await AsyncStorage.getItem('userSession');
        if (sessionData) {
          const userData = JSON.parse(sessionData);
          if (!captainId && userData.userId) {
            // route.params üzerinden gelmemişse AsyncStorage'dan alıyoruz
            navigation.setParams({ captainId: userData.userId });
          }
        }
      } catch (error) {
        console.error('Error loading captain ID:', error);
      }
    };

    if (!captainId) {
      loadCaptainId();
    }
  }, [captainId, navigation]);

  useFocusEffect(
    useCallback(() => {
      const fetchRegistrationNumber = async () => {
        if (!captainId) {
          console.log("Captain ID is missing");
          return;
        }

        try {        
          const response = await fetch(`${apiurl}/api/boat/${captainId}`);
          const regnumber = await response.json();
          if (regnumber?.rows?.length > 0) { 
            setRegistrationNumber(regnumber.rows[0].registrationnumber);
            // Registration number alındıktan sonra diğer verileri de yükle
            const fetchAllTourData = async () => {
              try {
                const response = await fetch(`${apiurl}/api/tours/${regnumber.rows[0].registrationnumber}`);
                const tours = await response.json();
                
                if (!tours.rows) {
                  setTourname("there is no exists tour of captain");
                } else if (tours.rows.length > 0) {
                  setTourname(tours.rows[0].tourname);
                }
        
                await fetchTourStops();
                await fetchTourTypes();
                await fetchBookedDates();
        
              } catch (error) {
                console.error("Error fetching tours:", error);
              }
            };
            
            fetchAllTourData();
          } else {
            console.log("Kayıt numarası bulunamadı.");
          }
        } catch (error) {
          console.log("Registration Number getirilemedi:", error.message);
        }
      };

      fetchRegistrationNumber();
    }, [captainId])
  );

  const fetchTourStops = async () => {
    try {
      const response = await fetch(`${apiurl}/api/allstops/${registrationNumber}`);
      const stops = await response.json();
      const cleanedStops = stops.map((stop) => ({
        id: stop.id,
        name: stop.name,
        description: stop.description === null ? "" : stop.description,
        location: {
          latitude: parseFloat(stop.latitude),
          longitude: parseFloat(stop.longitude)
        }
      }));
      setStops(cleanedStops);
    } catch (error) {
      console.error("Tour's stops can not taken :", error);
    }
  };
  
  const fetchTourTypes = async () => {
    try {
      const response = await fetch(`${apiurl}/api/tourplantype/${registrationNumber}`);
      const types = await response.json();
      setTourType(types);
    } catch (error) {
      console.error("Tour types can not taken:", error);
    }
  };
  
  const fetchBookedDates = async () => {
    try {
      const response = await fetch(`${apiurl}/api/rezervtour/${registrationNumber}`);
      const booked = await response.json();
      const adjustedBooked = booked.map(bd => ({
        ...bd,
        rezervdate: format(parseISO(bd.rezervdate), 'yyyy-MM-dd')
      }));
      setBookedDates(adjustedBooked);
    } catch (error) {
      console.log("Tour rezervations zamanları getirilemedi:", error);
    }
  };

  const fetchRezervations = async () => {
    try {
      const response = await fetch(`${apiurl}/api/rezervations/${captainId}`);
      const rezervs = await response.json();
      if (rezervs.rows === undefined) {
        return;
      } else if (rezervs && rezervs.rows.length > 0) {
        const adjustedRezervs = rezervs.rows.map(rz => ({
          ...rz,
          rezervdate: format(parseISO(rz.rezervdate), 'yyyy-MM-dd')
        }));
        console.log(adjustedRezervs);
        setFutureRezervs(adjustedRezervs);
      }
    } catch (error) {
      console.error('Error fetching rezervs:', error);
    }
  };
  
  useEffect(() => {
    fetchRezervations();
  }, [captainId]);


  const toggleStopSelection = (stop) => {
    const isSelected = selectedStops.some(s => s.id === stop.id);
    if (isSelected) {
      setSelectedStops(selectedStops.filter(s => s.id !== stop.id));
    } else {
      setSelectedStops([...selectedStops, stop]);
    }
    setNewTour({ ...newTour, stops: isSelected ? newTour.stops.filter(s => s.id !== stop.id) : [...newTour.stops, stop] });
  };

  const handleFoodToggle = () => {
    setFoodChoice(prev => {
      const newValue = !prev;
      setNewTour(tour => ({ ...tour, isfoodinclude: newValue }));
      return newValue;
    });
  };


  const calendarTheme = {
    backgroundColor: '#ffffff',
    calendarBackground: '#ffffff',
    textSectionTitleColor: '#b6c1cd',
    selectedDayBackgroundColor: '#089CFF',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#089CFF',
    dayTextColor: '#2d4150',
    textDisabledColor: '#d9e1e8',
    dotColor: '#089CFF',
    selectedDotColor: '#ffffff',
    arrowColor: '#089CFF',
    monthTextColor: '#089CFF',
    indicatorColor: '#089CFF',
    textDayFontWeight: '300',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '300',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 16
  };

  const todayDate = new Date();
  const futureRezervsFiltered =  futureRezervs.filter(rezerv => parseISO(rezerv.rezervdate) >= todayDate);
  const pastRezervFiltered = futureRezervs.filter(rezerv => parseISO(rezerv.rezervdate) < todayDate);

  
  
  const renderCalendarSection = () => {
    const markedDates = futureRezervs.reduce((acc, rezerv) => {
      const date = rezerv.rezervdate.substring(0, 10); // '2025-07-29'
      acc[date] = {
        customStyles: {
          container: {
            backgroundColor: 'red', // daire rengi
            borderRadius: 16,
          },
          text: {
            color: 'black',
            fontWeight: 'bold',
          }
        }
      };
      return acc;
    }, {});
  
    return (
      <View style={styles.calendarSection}>
        <Text style={styles.sectionTitle}>Müsaitlik Takvimi</Text>
        <Calendar
          theme={calendarTheme}
          minDate={format(new Date(), 'yyyy-MM-dd')}
          markedDates={markedDates}
          markingType={'custom'}
        />
        <View style={styles.calendarLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: 'red' }]} />
            <Text style={styles.legendText}>Dolu</Text>
          </View>
        </View>
      </View>
    );
  };
  
  const handleAddNewTour = async () => {
    try {
      await fetch(`${apiurl}/api/captainAddRezervation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourid : registrationNumber,
          captainid : captainId,
          userid : "14",
          lastAdditionTour: newTour,
        }),
      });
      
      setSelectedStops([]);
      setSelectedTourType("");
      setNewTour({ type: '', capacity: '', stops: [], price: '', date: '', isfoodinclude: false });
      fetchBookedDates();
      fetchTourStops();
      fetchTourTypes();
      fetchRezervations();

    } catch (error) {
      console.log("error mesaj : ", error);
    }
  };

  const handleCancelAddNewTour = () => {
    setSelectedStops([]);
    setSelectedTourType("");
    setNewTour({ type: '', capacity: '', stops: [], price: '', date: '', isfoodinclude: false });
  };

  const tourTypeColors = {
    daily: "#FF8C00",       // turuncu
    overnight: "#6A5ACD",   // mor
    fishing: "#228B22",     // yeşil
  };

  const getMarkedDates = () => {
    const marks = {};
  
    bookdates.forEach((bd) => {
      const dateKey = (bd.rezervdate).split('T')[0]; // şu anki hali
      const color = tourTypeColors[bd.rezervtourtype] || "#CCCCCC";
  
      // Eğer aynı tur tipi ise, disableTouchEvent: true
      const isSameType = bd.rezervtourtype === newTour.type === 'daily';
  
      marks[dateKey] = {
        marked: true,
        dotColor: color,
        selected: false,
        selectedColor: color,
        disableTouchEvent: isSameType, // sadece aynı türde olanlar tıklanamaz olacak
      };
    });
  
    // Seçilen günü de işaretle
    if (newTour.date) {
      marks[newTour.date] = {
        ...(marks[newTour.date] || {}),
        selected: true,
        selectedColor: '#089CFF',
        disableTouchEvent: false, // seçilen gün her zaman tıklanabilir
      };
    }
  
    return marks;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{captainTourName}</Text>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => {
            if (userType !== null) {
              navigation.navigate('Settings', { 
                userType: 'captain', 
                pastRezervedTour: pastRezervFiltered,
                captainId: captainId 
              });
            } else {
              alert('Kullanıcı bilgileri yüklenemedi.');
            }
          }}
        >
          <Image source={require('./assets/images/settings.png')} style={styles.settingsIcon} />
        </TouchableOpacity>
      </View>
      
        {captainTourName !== "there is no exists tour of captain" ? (
            <Text>  </Text>
          ) : (
            <TouchableOpacity
              style={styles.createTourButton}
              onPress={() => {
                if (registrationNumber && captainId) {
                  navigation.navigate('TourCreation', {
                    registrationNumber: registrationNumber,
                    captainId: captainId
                  });
                } else {
                  alert('Gerekli bilgiler eksik. Lütfen tekrar giriş yapın.');
                }
              }}
            >
              <Text style={styles.createTourButtonText}>Tur Sayfasi Oluştur</Text>
            </TouchableOpacity>
          )

        }
        
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rezervasyonlar</Text>

          {/* Eğer rezervasyonlar listesi boşsa, mesajı göster */}
          {futureRezervsFiltered.length === 0 ? (
            <Text>Henüz rezervasyonunuz bulunmamaktadır.</Text>
          ) : (
            <FlatList
              data={futureRezervsFiltered}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedRezervation(item)}>
                  <View style={styles.reservationItem}>
                    <Text>{item.username} - {item.rezervtourtype} - {item.rezervcapacity} - {format(parseISO(item.rezervdate), 'yyyy-MM-dd')} - {item.rezervprice}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.rezervationid.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
        
        {renderCalendarSection()}
        
        <TouchableOpacity style={styles.addTourButton} onPress={() => {setModalVisible(true); fetchBookedDates(); fetchTourStops(); fetchTourTypes(); }}>
          <Text style={styles.addTourButtonText}>Yeni Tur Ekle</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.myBoatButton} 
            onPress={() => {
                if (registrationNumber) {
                    navigation.navigate('TourPage', { registrationNumber: registrationNumber, userType: 'captain' });
                } else {
                    alert('Tekne bilgisi bulunamadı.');
                }
            }}
        >
            <Text style={styles.myBoatButtonText}>My Boat</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={!!selectedRezervation} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.rezervModalContent}>
            <Text style={styles.modalTitle}>Rezervasyon Detayları</Text>
            {selectedRezervation && (
              <>
                <Text>Müşteri Adi: {selectedRezervation.username}</Text>
                <Text>Kişi Sayisi: {selectedRezervation.rezervcapacity}</Text>
                <Text>Yemek Durumu: {selectedRezervation.isfoodinclude == false ? 'Yok' : 'Dahil'}</Text>
                <Text>Tur Tipi: {selectedRezervation.rezervtourtype}</Text>
                <Text>Tarih: {format(parseISO(selectedRezervation.rezervdate), 'yyyy-MM-dd')} - {format(parseISO(selectedRezervation.rezervdate), 'EEEE', { locale: tr })}</Text>
                <Text>Tur Başlama Saati: {selectedRezervation.starttime}</Text>
                <Text>Tur Bitiş Saati: {selectedRezervation.endtime}</Text>
                <Text>Fiyat: {selectedRezervation.rezervprice}</Text>
              </>
            )}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedRezervation(null)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Yeni Tur Ekle</Text>
          
          <Text>Tur Tipi:</Text>
          <Picker
            selectedValue={selectedTourType}
            onValueChange={(itemValue) => {
              setSelectedTourType(itemValue);
              setNewTour({ ...newTour, type: itemValue }); // newTour state'ine de ekliyoruz
            }}
          >
            <Picker.Item label="Tur tipi seçin..." value="" />
            {tourtype.map((type, index) => (
              <Picker.Item label={type.tourtype.charAt(0).toUpperCase() + type.tourtype.slice(1)} value={type.tourtype} key={index} />
            ))}
          </Picker>
          
          <Text>Kapasite:</Text>
          <TextInput 
            style={styles.input} 
            keyboardType="numeric" 
            placeholder="Max kişi sayısı" 
            onChangeText={(text) => setNewTour({ ...newTour, capacity: text })} 
          />
          
          <Text>Duraklar:</Text>
          <FlatList
            data={stops} // stops registrationnumber'a göre alınacak ve burada sadece stop ismi yer alacak kaptan bunu seçmeyebilir. 
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => toggleStopSelection(item)}>
                <Text style={[styles.stopItem, selectedStops.some(s => s.id === item.id) && styles.selectedStop]}>
                  {item.name} ({item.location.latitude}, {item.location.longitude})
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id.toString()}
            style={styles.stopsList}
          />
          
          <Text>Fiyat:</Text>
          <TextInput 
            style={styles.input} // fiyatı el ile girilecek yanında ise bir seçilebilir flatlist içinde para birimleri yer alacak, sembol değil yazı şeklinde
            keyboardType="numeric" 
            placeholder="TL cinsinden fiyat" 
            onChangeText={(text) => setNewTour({ ...newTour, price: text })} 
          />
          
          <Text>Tarih:</Text>
          <TouchableOpacity 
            style={styles.input} 
            onPress={() => setShowCalendar(true)} // buradaki açılan olan calendar ile ana sayfadaki calendar içindeki veriler bana lazım
          >
            <Text>{newTour.date || 'Tarih Seçin'}</Text> 
          </TouchableOpacity>

          <Text>Yemek Dahil mi ?</Text>
          <TouchableOpacity
            style={[
              styles.foodButton,
              { backgroundColor: foodChoice ? "#4CAF50" : "#f44336" } // true ise yeşil, false ise kırmızı
            ]}
            onPress={handleFoodToggle} // toggle
          >
            <Text style={styles.foodButtonText}>
              {foodChoice ? "Evet" : "Hayır"}
            </Text>
          </TouchableOpacity>

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => { setModalVisible(false); handleCancelAddNewTour();}}
            >
              <Text style={styles.modalButtonText}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.addButton]} 
              onPress={() => {
                setModalVisible(false);
                handleAddNewTour();
              }}
            >
              <Text style={styles.modalButtonText}>Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.calendarModal}>
          <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => {
              setNewTour({ ...newTour, date: day.dateString });
              setShowCalendar(false);
            }}
            markedDates={getMarkedDates()}
            minDate={new Date().toISOString().split('T')[0]}
            style={styles.calendar}
          />
            <TouchableOpacity 
              style={styles.closeCalendarButton}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.closeCalendarButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { 
    padding: 15, 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color:'black' },
  settingsButton: { padding: 10 },
  settingsIcon: { width: 24, height: 24 },
  content: { flex: 1 },
  section: { padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  reservationItem: { backgroundColor: '#f8f8f8', padding: 10, marginBottom: 5, borderRadius: 8 },
  addTourButton: { backgroundColor: '#089CFF', padding: 15, borderRadius: 8, alignItems: 'center', margin: 15 },
  createTourButton: { backgroundColor: '#73ffef', padding: 15, borderRadius: 8, alignItems: 'center', margin: 15 },
  createTourButtonText : { color: 'black', fontSize: 16, fontWeight: 'bold' },
  addTourButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  myBoatButton: { backgroundColor: '#FFA500', padding: 15, borderRadius: 8, alignItems: 'center', margin: 15 },
  myBoatButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  rezervModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
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
  calendar: {
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    width: '45%',
    backgroundColor: '#ccc',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#089CFF',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopsList: {
    maxHeight: 150,
    marginVertical: 10,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  stopItem: { padding: 10, backgroundColor: '#e8e8e8', marginVertical: 5, borderRadius: 5 },
  selectedStop: { backgroundColor: '#4CAF50', color: 'white' },
  calendarModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  closeCalendarButton: {
    backgroundColor: '#089CFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeCalendarButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarSection: {
    padding: 15,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },foodButton: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  
  foodButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});