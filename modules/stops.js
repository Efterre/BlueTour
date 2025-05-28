class Stop {
    constructor(id, name, description, latitude, longitude, types) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.latitude = parseFloat(latitude);
        this.longitude = parseFloat(longitude);
        this.types = Array.isArray(types) ? types : [types];
    }
}

// Durak tiplerinin renk kodları
const stopColors = {
    swimming: '#4CAF50', // Yeşil - Yüzme noktası
    fishing: '#FFC107',  // Sarı - Balık tutma noktası
    diving: '#2196F3',   // Mavi - Dalış noktası
};

// Durak tiplerinin açıklamaları
const stopTypes = {
    swimming: "Yüzme Noktası",
    fishing: "Balık Tutma Noktası",
    diving: "Dalış Noktası"
};

// API URL'i (bilgisayarınızın IP adresini buraya yazın)
const apiurl = "http://192.168.1.102:5000"; // XX yerine kendi IP adresinizi yazın

// Durakları getiren fonksiyon
async function fetchStops() {
    try {
        
        const response = await fetch(`${apiurl}/api/stops`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Yanıt:', errorText);
            throw new Error('Duraklar getirilemedi');
        }
        
        const data = await response.json();
        
        
        return data.map(stop => new Stop(
            stop.id,
            stop.name,
            stop.description,
            stop.latitude,
            stop.longitude,
            stop.types
        ));
    } catch (error) {
        console.error('API bağlantı hatası:', error);
        return [];
    }
}

// Belirli bir durağı ID'ye göre getiren fonksiyon
async function fetchStopById(id) {
    try {
        const response = await fetch(`${apiurl}/api/stops/${id}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Yanıt:', errorText);
            throw new Error('Durak getirilemedi');
        }
        
        const stop = await response.json();
        
        return new Stop(
            stop.id,
            stop.name,
            stop.description,
            stop.latitude,
            stop.longitude,
            stop.types
        );
    } catch (error) {
        console.error('Durak yüklenirken hata:', error);
        return null;
    }
}

module.exports = {
    Stop,
    fetchStops,
    fetchStopById,
    stopColors,
    stopTypes
};
