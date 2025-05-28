import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Linking, Alert, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Ad from './modules/ad'; // Ad modelini import ediyoruz
import { Calendar } from 'react-native-calendars';
import { format, addHours, parseISO } from 'date-fns';
import MapView, { Marker } from 'react-native-maps';
import swimming from './assets/images/swimming.png';
import fishing from './assets/images/fishing-rod.png';
import diving from './assets/images/scuba-diving.png';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';

const TourPage = ({ route, navigation }) => {
  const apiurl = "apiurl";
  const routeParams = route.params || {};
  const  { tourId, userType, userId } = routeParams;
  const registrationNumber = routeParams.registrationNumber ?? tourId;
  const [selectedDate, setSelectedDate] = useState(''); // bunu müşteri seçecek. müşteri burada book edeceği tarihi veya tarihleri seçecek. bir tarih seçmeden rezervasyon yapamaz.
  const [loading, setLoading] = useState(true); // bu sadece veritabanından verilerin gelip gelmediğini gösteren bir frontend state'i
  const [comments, setComments] = useState([]); // bu state önemli çünkü tekne turuna yapılan yorum text'leri geliyor.
  const [likeCount, setLikes] = useState(''); // bu state çünkü önemli like sayısı geliyor. 
  const [dislikeCount, setDislikes] = useState(''); // bu state önemli çünkü dislike sayısı geliyor
  const [plans, setPlans] = useState([]); // bu state öenmli burada tekne turunun planları geliyor bu plan içindeki veriler şunlar : tourtype, tourcapacity, defaultstarttime, defaultendtime, tourprice, feeunit
  const [bookedDates, setBookedDates] = useState({}); // bu state önemli burada tekne turuna ait bütün rezervsayon tarihleri geliyor. geçmiş de gelecek de. bunun içindeki veriler şunlar : rezervdate, starttime, endtime, rezervtourtype 
  const [stops, setStops] = useState([]); // burada tekne turunun gittiği bütün duraklar geliyor. buradaki veriler şunlar: id,name, description, latitude,  longitude,  types
  const [tourData, setTourData] = useState(null); // buradaki state ise şu veriler geliyor : tourname, description, latitude, longitude
  const [reyting, setReyting] = useState(''); // buradaki state ise oylamaların ortalamasını getiriyor. yani reyting.
  const [contexts, setContexts] = useState([]); // Context verilerini tutacak state
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false); // Harita modalı için state
  const [isLiked, setIsLiked] = useState(false); // Like durumu için state
  const [isDisliked, setIsDisliked] = useState(false); // Dislike durumu için state
  const [photos, setPhotos] = useState([]); // Fotoğraflar için state
  const [photosLoading, setPhotosLoading] = useState(true); // Fotoğrafların yüklenme durumu için state
  const [newComment, setNewComment] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [allContext, setAllContext] = useState([]);
  const [selectedContextId, setSelectedContextId] = useState([]);
  const [isContextModalVisible, setIsContextModalVisible] = useState(false);
  const [currentPlans, setCurrentPlans] = useState([]);
  const [beginContextId , setBeginContextId] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState('start');
  const [allStops , setAllStops] = useState([]);
  const [currentStops, setCurrentStops] = useState([]);
  const [isStopCustomizationEnabled, setIsStopCustomizationEnabled] = useState(false); // Durak özelleştirme durumu için state
  const [selectedCapacity, setSelectedCapacity] = useState(1); // Seçilen kapasiteyi saklamak için state
  const [selectedStops, setSelectedStops] = useState([]); // Seçilen durakların ID'lerini saklamak için state
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]); // New state for blocked dates

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

  const fetchTourData = async () => {
    try {
        const response = await fetch(`${apiurl}/api/tourpage/${registrationNumber}`);
        if (!response.ok) {
          throw new Error("Veriler çekilemedi");
        }
        const data = await response.json();
        setComments(data.comments.map(comment => ({
          date: new Date(comment.date).toLocaleDateString('tr-TR'),  // "21.04.2025"
          user: comment.user,
          text: comment.text,
          voteScore: comment.voteScore ?? 0
        })));
        setLikes(data.enjoyStats.enjoyCount === null ? 0 : data.enjoyStats.enjoyCount);
        setDislikes(data.enjoyStats.dislikeCount === null ? 0 : data.enjoyStats.dislikeCount);
        setPlans(data.plan);
        setCurrentPlans(data.plan);
        setBookedDates(data.rezervations);
        setStops(data.stops);
        setTourData(data.tour);
        setReyting(data.vote);
        setContexts(data.context.sort((a, b) => a.contextname.localeCompare(b.contextname)));
        setLoading(false);
        setCurrentStops(data.stops.map(stop => stop.id));

        try {
          const stopResponse = await fetch(`${apiurl}/api/stops`);
          if (!stopResponse.ok) {
            throw new Error("All Stops verileri çekilemedi");
          }
          
          const allStopsData = await stopResponse.json();
          
          setAllStops(allStopsData);

        } catch (error) {
          console.error("Duraklar alınırken hata oluştu:", error);
        }
        
      } catch (error) {
        console.error("Tour Datas alınırken hata oluştu:", error);
      }
    };
    
  useEffect(() => {
    fetchTourData();
  }, [registrationNumber]);

  const getAllContext = async () => {
    try {
        const response = await fetch(`${apiurl}/api/context`);
        if (!response.ok) {
          throw new Error("Veriler çekilemedi");
        }
        const data = await response.json();
        setAllContext(data);
      } catch (error) {
        
      }
    };
  
  useEffect(() => {
    getAllContext();
  }, [registrationNumber]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={20}
          color="#FFD700"
        />
      );
    }
    return stars;
  };

  const renderEditableText = (text, onEdit) => (
    <View style={styles.editableTextContainer}>
      <Text style={styles.text}>{text}</Text>
      {editing && (
        <TouchableOpacity onPress={onEdit} style={styles.pencilIcon}>
          <Ionicons name="pencil" size={20} color="#089CFF" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPhotos = () => (
    <View style={styles.photosSection}>
      {photosLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Fotoğraflar yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          horizontal
          data={photos}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: item }}
                style={styles.photo}
                resizeMode="cover"
              />
              {editing && (
                <TouchableOpacity onPress={() => {
                  // Fotoğraf düzenleme işlemi
                }}>
                  <Ionicons name="pencil" size={20} color="#089CFF" />
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );

  const renderLocationSection = () => (
    <View style={styles.locationSection}>
      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => setIsMapModalVisible(true)}
      >
        <Text style={styles.mapButtonText}>Haritada Göster</Text>
      </TouchableOpacity>

      {userType === 'appuser' && (
        <View style={styles.likeDislikeContainer}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => {
              const newLiked = !isLiked;
              const newDisliked = false;
              setIsLiked(!isLiked);
              setIsDisliked(false);
              handleEnjoyment(newLiked, newDisliked);
            }}
          >
            <Ionicons
              name={isLiked ? "thumbs-up" : "thumbs-up-outline"}
              size={24}
              color={isLiked ? "#089CFF" : "#000"}
            />
            <Text style={styles.likeCount}>{likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dislikeButton}
            onPress={() => {
              const newDisliked = !isDisliked;
              const newLiked = false;
              setIsDisliked(!isDisliked);
              setIsLiked(false);
              handleEnjoyment(newLiked, newDisliked);
            }}
          >
            <Ionicons
              name={isDisliked ? "thumbs-down" : "thumbs-down-outline"}
              size={24}
              color={isDisliked ? "#089CFF" : "#000"}
            />
            <Text style={styles.dislikeCount}>{dislikeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commentButton}
            onPress={() => setIsCommentsModalVisible(true)}
          >
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color="#000"
            />
            <Text style={styles.commentCount}>{comments.length}</Text>
          </TouchableOpacity>
        </View>
      )}
      {userType === 'captain' && (
        <View style={styles.likeDislikeContainer}>
          <TouchableOpacity
            style={styles.likeButton}
          >
            <Ionicons
              name={"thumbs-up-outline"}
              size={24}
              color={"#000"}
            />
            <Text style={styles.likeCount}>{likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dislikeButton}
          >
            <Ionicons
              name={"thumbs-down-outline"}
              size={24}
              color={"#000"}
            />
            <Text style={styles.dislikeCount}>{dislikeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commentButton}
            onPress={() => setIsCommentsModalVisible(true)}
          >
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color="#000"
            />
            <Text style={styles.commentCount}>{comments.length}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderDescription = () => (
    <View style={styles.descriptionSection}>
      <Text>Description</Text>
      <View style={styles.editableTextContainer}>
        {isEditingDescription ? (
          <TextInput
            style={styles.descriptionInput}
            value={tourData?.description || ''}
            onChangeText={(text) => setTourData(prev => ({ ...prev, description: text }))}
            multiline
          />
        ) : (
          <ScrollView style={styles.descriptionScroll}>
            <Text style={styles.descriptionText}>{tourData?.description || 'Açıklama bulunmuyor'}</Text>
          </ScrollView>
        )}
        {editing && (
          <TouchableOpacity onPress={() => setIsEditingDescription(!isEditingDescription)} style={styles.pencilIcon}>
            <Ionicons name="pencil" size={20} color="#089CFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderContexts = () => (
    <View style={styles.contextsSection}>
      <Text style={styles.sectionTitle}>İçerikler</Text>
      {renderEditableText(contexts.map(c => c.contextname).join(', '), () => setIsContextModalVisible(true))}
    </View>
  );

  const renderContextModal = () => (
    <Modal
      visible={isContextModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsContextModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>İçerik Seçimi</Text>
          <FlatList
            data={allContext}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (selectedContextId.includes(item.id)) {
                    setSelectedContextId(selectedContextId.filter(id => id !== item.id));
                  } else {
                    setSelectedContextId([...selectedContextId, item.id]);
                  }
                }}
                style={styles.contextItem}
              >
                <Text style={selectedContextId.includes(item.id) ? styles.selectedContextText : styles.contextText}>
                  {item.name}
                </Text>
                {selectedContextId.includes(item.id) && (
                  <Ionicons name="checkmark" size={20} color="#089CFF" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsContextModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  
  useEffect(() => {
    // contexts içindeki verilerin id'lerini selectedContextId'ye ekle
    const initialSelectedIds = contexts.map(c => {
      const context = allContext.find(ac => ac.name === c.contextname);
      return context ? context.id : null;
    }).filter(id => id !== null);
    setBeginContextId(initialSelectedIds);
    setSelectedContextId(initialSelectedIds);
  }, [contexts, allContext]);

  const getCurrencySymbol = (currency) => {
    const currencyMap = {
      'TRY': '₺',
      'TL': '₺',
      'USD': '$',
      'US$': '$',
      'EUR': '€',
      'EURO': '€',
      'RUB': '₽',
      'CHF': 'Fr',
      'JPY': '¥',
      'CNY': '¥',
      'GBP': '£',
      'STERLIN': '£'
    };

    // Para birimini büyük harfe çevir ve boşlukları kaldır
    const normalizedCurrency = currency.toUpperCase().trim();
    
    // Eğer para birimi harflerle yazılmışsa (örn: "dolar", "euro")
    const textToCurrency = {
      'TÜRK LİRASI': 'TRY',
      'TÜRKLİRASI': 'TRY',
      'DOLAR': 'USD',
      'EURO': 'EUR',
      'RUS RUBLESİ': 'RUB',
      'RUBLE': 'RUB',
      'İSVIÇRE FRANKI': 'CHF',
      'FRANK': 'CHF',
      'JAPON YENİ': 'JPY',
      'YEN': 'JPY',
      'ÇİN YUANI': 'CNY',
      'YUAN': 'CNY',
      'STERLİN': 'GBP',
      'İNGİLİZ STERLİNİ': 'GBP'
    };

    // Önce metin olarak yazılmış para birimlerini kontrol et
    const currencyCode = textToCurrency[normalizedCurrency] || normalizedCurrency;
    
    // Sembolü döndür, bulunamazsa orijinal değeri döndür
    return currencyMap[currencyCode] || currency;
  };

  const renderPlans = () => (
    <View style={styles.plansSection}>
      <Text style={styles.sectionTitle}>Planlar</Text>
      {currentPlans.map((plan, index) => (
        <TouchableOpacity
          key={plan.id || index}
          style={[
            styles.planItem,
            selectedPlanId === plan.id && styles.selectedPlan,
            selectedPlanIndex === index && styles.selectedPlan
          ]}
          onPress={() => handlePlanSelect(plan, index)}
        >
          <Text>
            {` ${plan.tourtype} , ${formatTime(plan.defaultstarttime)} - ${formatTime(plan.defaultendtime)} , Kapasite : ${plan.tourcapacity}`}
          </Text>
          <Text>
            {`Fiyat :  ${plan.tourprice} ${getCurrencySymbol(plan.feeunit)}`}
          </Text>
        
          {editing && renderEditablePlan(plan)}
        </TouchableOpacity>
      ))}
    </View>
  );
  

  const handleDeletePlan = (tourtype) => {
    setCurrentPlans(currentPlans.filter(plan => plan.tourtype !== tourtype));
  };

  const openTimePicker = (plan, mode) => {
    setSelectedPlan(plan);
    setTimePickerMode(mode);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const updatedTime = `${selectedTime.getHours()}:${selectedTime.getMinutes()}`;
      const updatedPlans = currentPlans.map((p) => {
        if (p.tourtype === selectedPlan.tourtype) {
          return {
            ...p,
            [timePickerMode === 'start' ? 'defaultstarttime' : 'defaultendtime']: updatedTime,
          };
        }
        return p;
      });
      setCurrentPlans(updatedPlans);
    }
  };

  const handleInputChange = (plan, field, value) => {
    const updatedPlans = currentPlans.map((p) => {
      if (p.tourtype === plan.tourtype) {
        return {
          ...p,
          [field]: value,
        };
      }
      return p;
    });
    setCurrentPlans(updatedPlans);
  };

  const renderEditablePlan = (plan) => (
    <View style={styles.planItem}>
      <TouchableOpacity onPress={() => openTimePicker(plan, 'start')}>
        <Text>{`Başlangıç: ${formatTime(plan.defaultstarttime)}`}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => openTimePicker(plan, 'end')}>
        <Text>{`Bitiş: ${formatTime(plan.defaultendtime)}`}</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between' }}>
        <Text style={{ marginRight: 10 }}>Kapasite:</Text>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={plan.tourcapacity.toString()}
          onChangeText={(text) => handleInputChange(plan, 'tourcapacity', parseInt(text, 10))}
          keyboardType="numeric"
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between' }}>
        <Text style={{ marginRight: 10 }}>Fiyat:</Text>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={plan.tourprice.toString()}
          onChangeText={(text) => handleInputChange(plan, 'tourprice', parseFloat(text))}
          keyboardType="numeric"
        />
      </View>
      <Picker
        selectedValue={plan.feeunit}
        onValueChange={(itemValue) => handleInputChange(plan, 'feeunit', itemValue)}
      >
        <Picker.Item label="₺" value="TRY" />
        <Picker.Item label="$" value="USD" />
        <Picker.Item label="€" value="EUR" />
        <Picker.Item label="£" value="GBP" />
      </Picker>
      <TouchableOpacity onPress={() => handleDeletePlan(plan.tourtype)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>-</Text>
      </TouchableOpacity>
    </View>
  );

  const handleSave = async () => {
    try {
      // Plan güncellemesi
      await fetch(`${apiurl}/api/updatePlan/${registrationNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastPlanList: currentPlans,
        }),
      });

      // Description güncellemesi
      await fetch(`${apiurl}/api/updateDescription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationnumber: registrationNumber,
          newDescription: tourData.description
        }),
      });

      // Context güncellemesi
      await fetch(`${apiurl}/api/updateTourContext/${registrationNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourid: registrationNumber,
          lastContextIdList: selectedContextId,
        }),
      });

      // Duraklar güncellemesi
      await fetch(`${apiurl}/api/updateTourAllStops/${registrationNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourid: registrationNumber,
          lastTourStops: currentStops,
        }),
      });

      // Başarılı bir şekilde kaydedildiğinde düzenleme modunu kapat
      setEditing(false);
      setIsEditingDescription(false);
      fetchTourData();
      getAllContext();
      alert('Değişiklikler başarıyla kaydedildi.');
    } catch (error) {
      console.error('Kaydetme işlemi sırasında hata oluştu:', error);
      alert('Değişiklikler kaydedilirken bir hata oluştu.');
    }
  };

  const formatTime = (time) => {
    if (!time) return 'Bilinmiyor';
    const date = new Date(`1970-01-01T${time}Z`);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const toggleStopSelection = (stopId) => {
    setSelectedStops((prevSelectedStops) => {
      if (prevSelectedStops.includes(stopId)) {
        // Eğer durak zaten seçiliyse, listeden çıkart
        return prevSelectedStops.filter(id => id !== stopId);
      } else if (prevSelectedStops.length < 3) {
        // Eğer 3'ten az durak seçiliyse, yeni durağı ekle
        return [...prevSelectedStops, stopId];
      }
      return prevSelectedStops; // 3 durak seçiliyse, yeni durak eklenmez
    });
  };

  const renderStopsMap = () => {
    const getMarkerImage = (types, isSelected) => {
      const images = [];
      if (types.includes('swimming')) images.push(swimming);
      else if (types.includes('fishing')) images.push(fishing);
      if (types.includes('diving')) images.push(diving);
      return images;
    };
    
    const renderMarkerContent = (types, isSelected) => {
      const images = getMarkerImage(types, isSelected);
      const markerStyle = isSelected ? styles.selectedMarker : styles.defaultMarker;
      
      if (images.length === 1) {
        return (
          <View style={[styles.singleMarkerContainer, markerStyle]}>
            <Image source={images[0]} style={styles.markerImage} />
          </View>
        );
      } else if (images.length === 2) {
        return (
          <View style={[styles.doubleMarkerContainer, markerStyle]}>
            <Image source={images[0]} style={[styles.markerImage, styles.halfMarker]} />
            <Image source={images[1]} style={[styles.markerImage, styles.halfMarker]} />
          </View>
        );
      } else if (images.length === 3) {
        return (
          <View style={[styles.tripleMarkerContainer, markerStyle]}>
            <Image source={images[0]} style={[styles.markerImage, styles.thirdMarker, styles.topMarker]} />
            <Image source={images[1]} style={[styles.markerImage, styles.thirdMarker, styles.middleMarker]} />
            <Image source={images[2]} style={[styles.markerImage, styles.thirdMarker, styles.bottomMarker]} />
          </View>
        );
      }
      return null;
    };
    
    return (
      
      <View style={styles.mapSection}>
        <Text style={styles.sectionTitle}>Duraklar</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: tourData?.latitude || 0,
            longitude: tourData?.longitude || 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {stops.map((stop, index) => {
            const isSelected = selectedStops.includes(stop.id);
            return (
              <Marker
                key={stop.id}
                coordinate={{
                  latitude: stop.latitude,
                  longitude: stop.longitude
                }}
                title={stop.name}
                description={stop.description}
                pinColor={isSelected ? "blue" : "red"} // seçiliyse mavi, değilse kırmızı
                onPress={() => {
                  if (userType === 'appuser' && isStopCustomizationEnabled) {
                    toggleStopSelection(stop.id);
                  }
                }}
              >
                {renderMarkerContent(stop.types, isSelected)}
              </Marker>
            );
          })}
        </MapView>
      </View>
    );
  };

  const renderCalendarSection = () => (
    <View style={styles.calendarSection}>
      <Text style={styles.sectionTitle}>Müsaitlik Takvimi</Text>
      <Calendar
        theme={calendarTheme}
        minDate={format(new Date(), 'yyyy-MM-dd')}
        markedDates={getMarkedDates()}
        onDayPress={(day) => {
          if (!getMarkedDates()[day.dateString]?.disabled) {
            setSelectedDate(day.dateString);
          }
        }}
        markingType={'dot'}
      />
      <View style={styles.calendarLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'red' }]} />
          <Text style={styles.legendText}>Dolu</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'orange' }]} />
          <Text style={styles.legendText}>Kaptan Tarafından Bloke</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#089CFF' }]} />
          <Text style={styles.legendText}>Seçili Tarih</Text>
        </View>
      </View>
    </View>
  );

  const handleSubmitComment = async () => {
    // Eğer yorum yoksa ve puan da verilmemişse hata ver
    if ((!newComment.trim() && selectedRating === 0)) {
      Alert.alert('Hata', 'Lütfen bir yorum yazın veya puan verin');
      return;
    }
  
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiurl}/api/votecomment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: newComment,
          date: new Date().toISOString().substring(0, 10),
          userid: userId,
          tourid: registrationNumber,
          vote: selectedRating !== 0 ? selectedRating : null, // Eğer 0 ise oyu null gönder
        }),
      });
  
      if (!response.ok) {
        throw new Error('Yorum gönderilemedi');
      }
  
      const result = await response.json();
      setComments([...comments, result]);
      setNewComment('');
      setSelectedRating(0);
      Alert.alert('Başarılı', 'Yorumunuz başarıyla gönderildi');
    } catch (error) {
      Alert.alert('Hata', 'Yorum gönderilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCommentSection = () => (
    <View style={styles.commentSection}>
      <Text style={styles.sectionTitle}>Yorum Yap</Text>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setSelectedRating(star)}
          >
            <Ionicons
              name={star <= selectedRating ? "star" : "star-outline"}
              size={30}
              color="#FFD700"
            />
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.commentInput}
        placeholder="Yorumunuzu yazın..."
        value={newComment}
        onChangeText={setNewComment}
        multiline
        numberOfLines={4}
      />
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmitComment}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCommentsModal = () => (
    <Modal
      visible={isCommentsModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsCommentsModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Yorumlar</Text>
            <TouchableOpacity
              onPress={() => setIsCommentsModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={comments}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>{item.user || 'Anonim Kullanıcı'}</Text>
                  <View style={styles.commentRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= item.voteScore ? "star" : "star-outline"}
                        size={16}
                        color="#FFD700"
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.commentText}>{item.comment}</Text>
                <Text style={styles.commentDate}>{item.date}</Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyComments}>
                <Text style={styles.emptyCommentsText}>Henüz yorum yapılmamış</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
  
  const renderBottomBar = () => {
    if (userType === 'captain') {
      return (
        <View style={styles.bottomBar}>
          {editing === false && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setEditing(true);
              }}
            >
              <Text style={styles.editButtonText}>Düzenle</Text>
            </TouchableOpacity>
          )}
        
          {editing === true && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleSave}
            >
              <Text style={styles.editButtonText}>Kaydet</Text>
            </TouchableOpacity>
          )}

          {editing === true && (
            <TouchableOpacity
              style={styles.cancelEditButton}
              onPress={cancelUpdating}
            >
              <Text style={styles.cancelEditButtonText}>İptal Et</Text>
            </TouchableOpacity>
          )}

        </View>
      );
    } else {
      return (
        <View style={styles.bottomBar}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Kişi Başı</Text>
            <Text style={styles.price}>
              {selectedPlan?.tourprice || plans[0]?.tourprice} {getCurrencySymbol(selectedPlan?.feeunit || plans[0]?.feeunit)}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.bookButton, 
              {opacity: (tourData && selectedDate && selectedPlan) ? 1 : 0.5}]}
            disabled={!tourData || !selectedDate || !selectedPlan}
            onPress={() => {
              Alert.alert(
                'Onay',
                `Kişi Sayısı : ${selectedCapacity}\nPlan : ${selectedPlan.tourtype.charAt(0).toUpperCase() + selectedPlan.tourtype.slice(1)} ${selectedPlan.defaultstarttime} - ${selectedPlan.defaultendtime} \nSelected Stops : ${selectedStops.length}`,
                [
                  { text: 'İptal', style: 'cancel' },
                  {
                    text: 'Evet',
                    onPress: () => {
                      setIsPaymentModalVisible(true);
                      handleOpenPaymentModal();
                    },
                  },
                ],
                { cancelable: true }
              );
              
            }}
          >
            <Text style={styles.bookButtonText}>
              {!selectedDate ? 'Tarih Seçiniz' : 
               !selectedPlan ? 'Plan Seçiniz' : 
               'Rezervasyon Yap'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const handleFakePayment = () => {
    if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
      Alert.alert('Hata', 'Lütfen tüm kart bilgilerini doldurun.');
      return;
    }
    else if (cardNumber.replace(/\D/g, '').length !== 16) {
      Alert.alert('Hata', 'Kart numarası 16 haneli olmalıdır.');
      return;
    }
    else if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      Alert.alert('Hata', 'Son kullanma tarihi AA/YY formatında olmalıdır.');
      return;
    }
    else if (cardCvc.length !== 3) {
      Alert.alert('Hata', 'CVC 3 haneli olmalıdır.');
      return;
    }

    setIsPaymentProcessing(true);
    setTimeout(() => {
      setIsPaymentProcessing(false);
      setIsPaymentModalVisible(false);
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      completeRezervation();
      fetchTourData();
      setSelectedPlan(null);
      setSelectedStops([]);
      setSelectedDate(null);
      setSelectedCapacity(1);
      
      Alert.alert('Başarılı', 'Ödeme işlemi başarıyla tamamlandı!');

    }, 2000);
  };

  const handleOpenPaymentModal = async () => {
    
    try {
      const response = await fetch(`${apiurl}/api/blockdate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: registrationNumber,
          rezervDate: selectedDate,
          userId: userId
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        Alert.alert('Hata', result.message || 'Tarih blokajı yapılamadı.');
        return;
      }
      setIsPaymentModalVisible(true);
    } catch (error) {
      Alert.alert('Hata', 'Sunucuya ulaşılamadı.');
    }
  };

  const handleCancelPayment = async () => {
    setIsPaymentModalVisible(false);
     
    try {
      await fetch(`${apiurl}/api/unblockdate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: registrationNumber,
          rezervDate: selectedDate,
          userId: userId
        }),
      });
    } catch (error) {
      // Sessizce geçilebilir
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  const cancelUpdating = () => {
    setEditing(false);
    setCurrentPlans(plans);
    setSelectedContextId(beginContextId);
    setCurrentStops(stops.map(stop => stop.id));
  };

  const renderPaymentModal = () => (
    <Modal
      isVisible={isPaymentModalVisible}
      onBackdropPress={() => !isPaymentProcessing && handleCancelPayment()}
      animationIn="zoomIn"
      animationOut="zoomOut"
    >
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 12,
          alignItems: 'center',
          width: '90%',
          minHeight: 400,
          alignSelf: 'center',
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Ödeme Ekranı</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 10,
            width: '100%',
            marginBottom: 10,
          }}
          placeholder="Kart Sahibi"
          value={cardName}
          onChangeText={setCardName}
          editable={!isPaymentProcessing}
        />
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 10,
            width: '100%',
            marginBottom: 10,
          }}
          placeholder="Kart Numarası (örn: 4242 4242 4242 4242)"
          value={cardNumber}
          onChangeText={handleCardNumberChange}
          keyboardType="number-pad"
          maxLength={19}
          editable={!isPaymentProcessing}
        />
        <View style={{ flexDirection: 'row', width: '100%', marginBottom: 10 }}>
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 10,
              marginRight: 5,
            }}
            placeholder="Son Kullanma (AA/YY)"
            value={cardExpiry}
            onChangeText={handleCardExpiryChange}
            maxLength={5}
            editable={!isPaymentProcessing}
          />
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 10,
              marginLeft: 5,
            }}
            placeholder="CVC"
            value={cardCvc}
            onChangeText={setCardCvc}
            keyboardType="number-pad"
            maxLength={4}
            editable={!isPaymentProcessing}
          />
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: isPaymentProcessing ? '#ccc' : '#089CFF',
            padding: 12,
            borderRadius: 8,
            width: '100%',
            alignItems: 'center',
            marginBottom: 8,
          }}
          onPress={handleFakePayment}
          disabled={isPaymentProcessing}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            {isPaymentProcessing ? 'Ödeme Yapılıyor...' : 'Ödeme Yap'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => !isPaymentProcessing && handleCancelPayment()}
          disabled={isPaymentProcessing}
        >
          <Text style={{ color: '#089CFF', marginTop: 8 }}>İptal</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  const formatExpiry = (text) => {
    // Sadece rakamları al
    const cleaned = text.replace(/\D+/g, '');
    let month = cleaned.slice(0, 2);
    const year = cleaned.slice(2, 4);
  
    // Ay 01–12 aralığında değilse düzelt
    if (month.length === 2) {
      const monthNum = parseInt(month, 10);
      if (monthNum < 1) {
        month = '01';
      } else if (monthNum > 12) {
        month = '12';
      }
    }
  
    let formatted = month;
    if (year.length > 0) {
      formatted += '/' + year;
    }
  
    return formatted.slice(0, 5);
  };
  
  const handleCardExpiryChange = (text) => {
    setCardExpiry(formatExpiry(text));
  };

  const formatCardNumber = (text) => {
    // Sadece rakamları al
    const cleaned = text.replace(/\D+/g, '');
    // 16 haneden fazla olmasın
    const limited = cleaned.slice(0, 16);
    // Her 4 hanede bir boşluk ekle
    const formatted = limited.replace(/(.{4})/g, '$1-').trim();
    return formatted;
  };

  const handleCardNumberChange = (text) => {
    setCardNumber(formatCardNumber(text));
  };

  const completeRezervation = async () => {
    try {
      const response = await fetch(`${apiurl}/api/rezervationpayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId, 
          tourId: registrationNumber,
          rezervPlan: selectedPlan,
          rezervStops: selectedStops,
          rezervDate: selectedDate,
          rezervCapacity: selectedCapacity
        }),
      });

      const result = await response.json();

      
      if (!response.ok) {
        console.error(result);
        Alert.alert('Hata', 'Ödeme alındı ancak veritabanı güncellenemedi.');
      }      

    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Sunucu hatası oluştu.');
    }



  };

  const getMarkedDates = () => {
    const marked = {};
    // bookedDates ve blockedDates'i birleştir
    const allBlocked = [...bookedDates, ...blockedDates];
    allBlocked.forEach(item => {
      // UTC tarihini al ve formatla
      const utcDate = item.rezervdate || item.date;
      if (utcDate) {
        const dateObj = parseISO(utcDate);
        const localDate = addHours(dateObj, 3);
        const dateStr = format(localDate, 'yyyy-MM-dd');
        marked[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
          marked: true,
          dotColor: item.isTemporary ? 'black' : 'red' // geçici blokaj için farklı renk
        };
      }
    });
    // Seçili tarihi de ekle
    if (selectedDate) {
      marked[selectedDate] = {
        ...(marked[selectedDate] || {}),
        selected: true,
        selectedColor: '#089CFF'
      };
    }
    return marked;
  };

  const handlePlanSelect = (plan, index) => {
    setSelectedPlanIndex(index);
    setSelectedPlan(plan);
  };

  const handleEnjoyment = async (isLiked, isDisliked) => {
    console.log(isLiked, isDisliked);
    try {
      const response = await fetch(`${apiurl}/api/postenjoyment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          tourId: registrationNumber,
          liked: isLiked,
          disliked: isDisliked
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        Alert.alert('Hata', result.message || 'Öneri kaydedilemedi.');
        return;
      }

    } catch (error) {
      console.error('Enjoyment hatası:', error);
      Alert.alert('Hata', 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
      // Hata durumunda like/dislike durumunu eski haline getir
      setIsLiked(!isLiked);
      setIsDisliked(!isDisliked);
      fetchTourData();
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{"< Geri"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{tourData?.tourname || 'Tur Detayları'}</Text>
          <View style={styles.ratingContainer}>
            {renderStars(reyting)}
          </View>
        </View>

        {renderPhotos()}

        {renderLocationSection()}

        {renderDescription()}

        {renderContexts()}

        {renderPlans()}

        {userType === 'appuser' && (
          <>
            <View style={styles.capacitySection}>
              <Text style={styles.capacityLabel}>Kapasite:</Text>
              <Picker
                selectedValue={selectedCapacity}
                onValueChange={(itemValue) => setSelectedCapacity(itemValue)}
                style={styles.capacityPicker}
                itemStyle={styles.capacityPickerItem}
              >
                {Array.from({ length: selectedPlan?.tourcapacity || 1 }, (_, i) => i + 1).map((number) => (
                  <Picker.Item key={number} label={number.toString()} value={number} />
                ))}
              </Picker>
            </View>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Durak Özelleştirme : </Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  isStopCustomizationEnabled && styles.toggleButtonActive
                ]}
                onPress={() => setIsStopCustomizationEnabled(!isStopCustomizationEnabled)}
              >
                <Text style={styles.toggleButtonText}>
                  {isStopCustomizationEnabled ? 'Evet' : 'Hayır'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}


        {renderStopsMap()}

        {userType === 'appuser' && renderCalendarSection()}

        {userType === 'appuser' && renderCommentSection()}

        {renderBottomBar()}
      </ScrollView>

      {renderContextModal()}

      <Modal
        visible={isMapModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsMapModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
            <MapView
              style={styles.modalMap}
              initialRegion={{
                latitude: tourData?.latitude || 0,
                longitude: tourData?.longitude || 0,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: tourData?.latitude || 0,
                  longitude: tourData?.longitude || 0,
                }}
                title={tourData?.tourname}
              />
            </MapView>
          </View>
        </View>
      </Modal>

      {renderCommentsModal()}

      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {renderPaymentModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  photosSection: {
    height: 200,
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 200,
    height: 200,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  locationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  mapButton: {
    backgroundColor: '#089CFF',
    padding: 10,
    borderRadius: 5,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  likeDislikeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  dislikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 5,
  },
  dislikeCount: {
    marginLeft: 5,
  },
  descriptionSection: {
    padding: 15,
  },
  descriptionScroll: {
    maxHeight: 150,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  contextsSection: {
    padding: 15,
  },
  contextsScroll: {
    marginTop: 10,
  },
  contextItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  contextText: {
    fontSize: 14,
  },
  plansSection: {
    padding: 15,
  },
  planItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedPlan: {
    borderColor: '#089CFF',
    borderWidth: 2,
  },
  planType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  planTime: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  planPrice: {
    fontSize: 16,
    color: '#089CFF',
  },
  mapSection: {
    height: 300,
    margin: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#089CFF',
  },
  bookButton: {
    backgroundColor: '#089CFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginLeft: 20,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalMap: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: '#089CFF',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  commentSection: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#089CFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  commentCount: {
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  commentItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentUser: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  commentRating: {
    flexDirection: 'row',
  },
  commentText: {
    fontSize: 14,
    marginBottom: 5,
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyComments: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyCommentsText: {
    fontSize: 16,
    color: '#666',
  },
  singleMarkerContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#089CFF',
  },
  doubleMarkerContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#089CFF',
    overflow: 'hidden',
  },
  tripleMarkerContainer: {
    width: 40,
    height: 80, // 3 resim için yeterli yükseklik
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#089CFF',
    overflow: 'hidden',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  markerImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  halfMarker: {
    width: '50%',
    height: '100%',
  },
  thirdMarker: {
    width: '100%',
    height: '33.33%', // Her resim için eşit yükseklik
    
  },
  editButton: {
    backgroundColor: '#089CFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginLeft: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editableTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
  },
  photoContainer: {
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 24,
    width: '92%',
    height: 100,
  },
  pencilIcon: {
    marginLeft: 'auto',
  },
  selectedContextText: {
    fontWeight: 'bold',
    color: '#089CFF',
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  editButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteIcon: {
    marginLeft: 10,
  },
  cancelEditButton: {
    backgroundColor : 'red',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginLeft: 20,
  },
  cancelEditButtonText : {
    fontWeight: 'bold',
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    width: 100,
    height: 40,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  
  toggleButtonActive: {
    backgroundColor: '#03f480', // Açıkken yeşil gibi
  },
  
  toggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  capacitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  capacityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  capacityPicker: {
    flex: 1,
  },
  capacityPickerItem: {
    // Add any necessary styles for picker items
  },
  selectedMarker: {
    borderColor: 'blue',
    borderWidth: 2,
  },
  defaultMarker: {
    borderColor: 'red',
    borderWidth: 2,
  },
  timePickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  timePickerContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  timePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default TourPage;
