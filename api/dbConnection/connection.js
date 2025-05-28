require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { authenticateUser, getUserDetails } = require('../services/pgauthentication');
const { preProcessFile } = require("typescript");

const app = express();
const port = 5000;

// CORS ayarlarını güncelle
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));

app.use(express.json());

// PostgreSQL bağlantısı
const pool = new Pool({
  user: "username",
  host: "hostname",
  database: "dbname",
  password: "password",
  port: 0,
});

// Test endpoint'i
app.get("/test", (req, res) => {
  res.json({ message: "API çalışıyor!" });
});

// Kullanıcıyı veritabanında doğrulayan endpoint
app.post("/api/authenticate", async (req, res) => {
  const { useremail, userpassword } = req.body;

  const result = await authenticateUser(useremail, userpassword);
  if (result.success) {
    console.log("Kullanıcı doğrulandı:", result.user);
    res.json(result);
  } else {
    console.log("Authentication failed:", result.message);
    res.status(401).json(result);
  }
});

// Kullanıcıyı veritabanına kaydeden endpoint
app.post("/api/users", async (req, res) => {
  const { email, userType, username, phone, password, bindingNumber, boatName, boundport , boatType, material, taxOffice, taxNumber } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Kullanıcı ID'sini almak için önce son eklenen kullanıcı ID'sini çekiyoruz
    const lastUserQuery = `SELECT MAX(userid) as last_user_id FROM bluetour.appuser`;
    const lastUserResult = await client.query(lastUserQuery);
    const newUserId = parseInt(lastUserResult.rows[0].last_user_id) + 1;  // ID'yi bir arttırıyoruz

    // Yeni kullanıcıyı ekliyoruz
    const userQuery = `
      INSERT INTO bluetour.appuser (userid, usertype, username, useremail, userphone, userpassword)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING userid
    `;
    const userValues = [newUserId, userType, username, email, phone, password];
    await client.query(userQuery, userValues);

    if (userType === 1) { // Captain
      const captainQuery = `
        INSERT INTO bluetour.captainuser (appuserid)
        VALUES ($1)
      `;
      const captainValues = [newUserId];
      await client.query(captainQuery, captainValues);

      const boatQuery = `
        INSERT INTO bluetour.boat (registrationnumber, boatName, boundport, boattypeid, manufacturematerial, taxnumber, taxoffice, captainid)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      const boatValues = [bindingNumber, boatName, boundport, boatType, material, taxNumber, taxOffice, newUserId];
      await client.query(boatQuery, boatValues);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: "Kullanıcı başarıyla kaydedildi" });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Kullanıcı kaydedilirken hata oluştu:", error);
    res.status(500).json({ error: "Kullanıcı kaydedilemedi", details: error.message });
  } finally {
    client.release();
  }
});
// Kullanıcı detaylarını getiren endpoint
app.get("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params.userId;

    const userDetails = await getUserDetails(userId);
    res.json(userDetails);
  } catch (error) {
    console.error("Kullanıcı bilgileri getirilirken hata:", error);
    res.status(500).json({ error: "Kullanıcı bilgileri getirilemedi" });
  }
});



// Kaptanın teknelerini getiren endpoint
app.get("/api/boat/:captainid", async (req,res) => {
  try{
    const {captainid} = req.params;

    const query = `
    select registrationnumber from bluetour.boat as b
    where b.captainid = $1
    `;

    const result = await pool.query(query, [captainid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "RegistrationNumber bulunamadı" });
    }
    
    res.json(result); // Sadece rows'u gönder
  
  } catch (error) {
    res.status(500).json({ error: "Tour getirilemedi", details: error.message });
  }
});
// kaptan tur sayfasını oluşturan endpoint   // buraya plan ve contex tablolarına da veri eklemek gerekiyor.
app.post("/api/addtour", async (req, res) => {
  

  const {
    boatregistrationnumber, tourname, isdivingtour, isfishingtour, isdailytour, isovernighttour, isspecialtour, 
    capacity, foodstate, isavaliable, feerenttour, feeovernighttour, feeperhour, 
    feefishingtour, feedivingtour, foodpriceperperson, foodprice, feeunit, 
    description, countyid,
    dailycapacity, dailystarttime, dailyendtime,
    fishingcapacity, fishingstarttime, fishingendtime,
    divingcapacity, divingstarttime, divingendtime,
    overnightcapacity, overnightstarttime, overnightendtime,
    specialcapacity, specialstarttime, specialendtime,
    selectedContextIds
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1️ **Tour tablosuna ekleme**
    const tourQuery = `
      INSERT INTO bluetour.tour (boatregistrationnumber, tourname, isdivingtour, isfishingtour, isdailytour,
      isovernighttour, isspecialtour, capacity, foodstate, isavaliable, foodpriceperperson, foodprice, 
      description, countyid)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `;

    const tourValues = [
      boatregistrationnumber, tourname, isdivingtour, isfishingtour, isdailytour, 
      isovernighttour, isspecialtour, capacity, foodstate, isavaliable, 
      foodpriceperperson, foodprice, description, 
      countyid || null // Eğer description boş string ise null olarak kaydet
    ];

    await client.query(tourQuery, tourValues);

    // 2️ **Plan tablosuna ekleme (Her bir tourtype için)**
    const planQuery = `
      INSERT INTO bluetour.plan (plantourid, tourtype, tourcapacity, defaultstarttime, defaultendtime, tourprice, feeunit)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const planValues = [];

    if (isdailytour) {
      planValues.push([boatregistrationnumber, "daily", dailycapacity, dailystarttime, dailyendtime, feerenttour, feeunit]);
    }
    if (isfishingtour) {
      planValues.push([boatregistrationnumber, "fishing", fishingcapacity, fishingstarttime, fishingendtime, feefishingtour, feeunit]);
    }
    if (isdivingtour) {
      planValues.push([boatregistrationnumber, "diving", divingcapacity, divingstarttime, divingendtime, feedivingtour, feeunit]);
    }
    if (isovernighttour) {
      planValues.push([boatregistrationnumber, "overnight", overnightcapacity, overnightstarttime, overnightendtime, feeovernighttour, feeunit]);
    }
    if (isspecialtour) {
      planValues.push([boatregistrationnumber, "special", specialcapacity, specialstarttime, specialendtime, feeperhour, feeunit]);
    }

    // Eğer en az bir plan varsa ekleme yapalım
    for (let values of planValues) {
      await client.query(planQuery, values);
    }

    // Tour context'leri ekleyelim
    if (selectedContextIds && selectedContextIds.length > 0) {
      const contextQuery = `
        INSERT INTO bluetour.tourcontext (context_contextid,tour_tourid)
        VALUES ($1, $2)
      `;

      for (const contextId of selectedContextIds) {
        await client.query(contextQuery, [ contextId, boatregistrationnumber]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: "Tur, plan ve contextler başarıyla kaydedildi" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Hata oluştu:", error);
    res.status(500).json({ error: "Kayıt işlemi başarısız", details: error.message });
  } finally {
    client.release();
  }
});
//Captana ait teknenin tur attributelarını getiren endpoint
app.get("/api/tours/:registrationnumber", async (req, res) => {
  try {
    const { registrationnumber } = req.params;
    const query = `
      SELECT t.boatregistrationnumber, t.tourname FROM bluetour.tour as t
      WHERE t.boatregistrationnumber = $1
      `;

      const result = await pool.query(query, [registrationnumber]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Tour bulunamadı." });
      }
      
    res.json(result); // Sadece rows'u gönder
    
  } catch (error) {
    res.status(500).json({ error: "Tour getirilemedi", details: error.message });
  } 
});
// tour page'de gözükecek olan bütün veriler buradan alınacak burada birden fazla tablodan veri çekilecek
app.get("/api/tourpage/:registrationnumber", async (req,res) => {
  const registrationNumber = req.params.registrationnumber;

  const tourQuery = ` 
  select t.tourname, t.description from bluetour.tour as t
  where t.boatregistrationnumber = $1
  `;

  const tourResult = await pool.query(tourQuery, [registrationNumber]);

  if (tourResult.rows.length === 0) {
    return res.status(404).json({ message: "Tour bulunamadı." });
  }

  const voteQuery = `
  select votescore from bluetour.vote
  where tourid = $1
  `;

  const voteResult = await pool.query(voteQuery, [ registrationNumber]);

  // Eğer oylama verisi yoksa, response'ta 0 olarak işliyoruz
  const voteCount = voteResult.rows.length;
  const averageVote = voteCount > 0 
    ? voteResult.rows.reduce((sum, row) => sum + row.votescore, 0) / voteCount 
    : 0;
  // tura ait kaptanın seçtiği bütün contextin isimleri alınacak
  const contextQuery = ` 
  select distinct contextname from bluetour.tourpage
  where boatregistrationnumber = $1
  `;

  const contextResult = await pool.query(contextQuery,[registrationNumber]);
  // tura ait kaptanın oluşturduğu planlar getirilecek
  const planQuery = `
  select tourtype, tourcapacity, defaultstarttime, defaultendtime, tourprice, feeunit from bluetour.plan
  where plantourid = $1
  `;

  const planResult = await pool.query(planQuery,[registrationNumber]);
  // turun gittiği bütün duraklar getiriliyor
  const stopQuery = `
      select         
          stopid,
          stopname,
          description,
          latitude,
          longitude,
          array_agg("type") as types from bluetour.stopoftour
      where boatregistrationnumber = $1
        GROUP BY stopid, stopname, description, latitude, longitude`;

  const stopResult = await pool.query(stopQuery,[registrationNumber]);

    // Tüm durakları bir array içinde döndür
  const arrayStops = stopResult.rows.map(row => ({
    id: row.stopid,
    name: row.stopname,
    description: row.description,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    types: row.types
  }));

  const enjoyQuery = `
  SELECT 
    SUM(CASE WHEN enjoyment = TRUE THEN 1 ELSE 0 END) AS true_count,
    SUM(CASE WHEN enjoyment = FALSE THEN 1 ELSE 0 END) AS false_count
  FROM bluetour.enjoyment
  WHERE tourid = $1
  `;

  const enjoyResult = await pool.query(enjoyQuery,[registrationNumber]);

  const commentQuery = `
  select commentdate, username, commenttext, votescore from bluetour.comment as c
  left join bluetour.appuser as au
    on c.appuserid = au.userid
  left join bluetour.vote as v
    on c.appuserid = v.appuserid 
    and c.tourid = v.tourid
  where c.tourid = $1
  `;
  
  const commentResult = await pool.query(commentQuery,[registrationNumber]);

  const rezervationQuery = `
      select rezervdate, starttime, endtime, rezervtourtype 
      from bluetour.captainrezervations
      where boatregistrationnumber = $1`;

  const rezervationResult = await pool.query(rezervationQuery,[registrationNumber]);

  res.json({
    tour: {...tourResult.rows[0],
    latitude: tourResult.rows[0]?.latitude ?? 39.330024,
    longitude: tourResult.rows[0]?.longitude ?? 26.663540},
    vote: {
      averageVote,  // Ortalama oyu
      voteCount     // Toplam oy sayısı
    },
    context: contextResult.rows,  // Kontekst bilgileri
    plan: planResult.rows,  // Plan bilgileri
    stops: arrayStops,  // Duraklar
    enjoyStats: {
      enjoyCount: enjoyResult.rows[0].true_count,  // Beğenilen sayısı
      dislikeCount: enjoyResult.rows[0].false_count  // Beğenilmeyen sayısı
    },
    comments: commentResult.rows.map(comment => ({
      date: comment.commentdate,
      user: comment.username,
      text: comment.commenttext,
      voteScore: comment.votescore  
    })),  // Yorumlar ve score
    rezervations: rezervationResult.rows  // Rezervasyonlar
  });

});
//tour'ın planlarının tipini getiren endpoint
app.get("/api/tourplantype/:registrationnumber", async(req,res) => {
  const registrationnumber = req.params.registrationnumber;

  try {
    const query = `
    select distinct tourtype from bluetour.plan
    where plantourid = $1
    `;

    const result = await pool.query(query, [registrationnumber]);

    res.json(result.rows);

  } catch (error) {
    console.log("Error : ", error.message);
  }
})


// Turların rezervasyonunu getiren endpoint
app.get("/api/rezervations/:captainid", async (req, res) => {
  try {
    const { captainid } = req.params;
    
    const query = `
    SELECT * FROM bluetour.captainrezervations
    WHERE userid is not null and "captainid" = $1
    ORDER BY boatregistrationnumber,rezervdate ASC 
    `;
    
    const result = await pool.query(query, [captainid]);
    
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Rezervation bulunamadı" });
    }
    
    res.json(result);
    
  } catch (error) {
    res.status(500).json({ error: "Tour getirilemedi", details: error.message });
  }
  
  
});
// turların calendar'ı için rezervasyon yapılan tarihleri alıyoruz. ve bu sayede her bir calendar tour'a özgü olacak.
app.get("/api/rezervtour/:tourid", async (req,res) => {
  try {
    

    const registrationnumber = req.params.tourid;
    

    const query = `select 
      rezervdate, starttime, endtime, rezervtourtype 
      from bluetour.captainrezervations
      where boatregistrationnumber = $1
    `;
    

    const result = await pool.query(query, [registrationnumber]);
    
    
    if (result.rows.length === 0) {
      return res.status(200).json([]); // Boş bir array dönüyoruz
    }
    
    const rezervtours = result.rows.map(row => ({
      rezervdate: row.rezervdate,
      starttime: row.starttime,
      endtime: row.endtime,
      rezervtourtype: row.rezervtourtype
    }));

    res.json(rezervtours);

  } catch (error) {
    console.error("rezervations getirilirken hata oluştu:", error);
    res.status(500).json({ error: "Tour getirilemedi", details: error.message });
  }
});
// kaptan sistemde kayıtlı olmayan kullanıcının turunu ekliyor.
app.post("/api/captainAddRezervation", async(req,res) => {
  const {
    tourid, captainid, userid, lastAdditionTour
  } = req.body;

  const stopIds = lastAdditionTour.stops.map(item => item.id);
  const client = await pool.connect();
  try {

    const getDefaultTimesQuery = `
      select distinct defaultstarttime, defaultendtime from bluetour.plan
      where plantourid = $1 and tourtype = $2;
    `; 

    const getDefaultTimesResult = await pool.query(getDefaultTimesQuery, [tourid, lastAdditionTour.type]);
    
    const defaultstarttime = getDefaultTimesResult.rows[0].defaultstarttime;
    const defaultendtime = getDefaultTimesResult.rows[0].defaultendtime;

    const lastRezervQuery = `SELECT MAX(rezervationid) as last_rezerv_id FROM bluetour.rezervation`;
    const lastRezervResult = await client.query(lastRezervQuery);
    const newRezervId = parseInt(lastRezervResult.rows[0].last_rezerv_id) + 1;  // ID'yi bir arttırıyoruz

    const rezervValues = [newRezervId, userid, tourid, lastAdditionTour.capacity, defaultstarttime, defaultendtime,
      lastAdditionTour.date, lastAdditionTour.type, lastAdditionTour.price, lastAdditionTour.isfoodinclude
    ] ; 

    const rezervQuery = `
    insert into bluetour.rezervation (rezervationid, appuserid,tourid,rezervcapacity, starttime, endtime, rezervdate, 
    rezervtourtype, rezervprice, isfoodinclude )
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `

    await client.query(rezervQuery, rezervValues);

    const rezervAllStopQuery = `
      insert into bluetour.rezervation_tour_allstops (rezervation_rezervationid, tour_tourid , allstops_stopid)
      values ($1, $2, $3)
    `;
    

    await Promise.all(
      stopIds.map((stopId) =>
        client.query(rezervAllStopQuery, [newRezervId , tourid, stopId])
      )
    );


  } catch (error) {
    console.error("Rezervasyon ekleme sırasında hata oluştu:", error);
  }
  
});
// kullanıcının booking yapmasını sağlayan endpoint
app.post("/api/rezervationpayment", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { userId, tourId, rezervPlan, rezervStops, rezervDate, rezervCapacity } = req.body;
    const {
      defaultendtime,
      defaultstarttime,
      feeunit,
      tourcapacity,
      tourprice,
      tourtype
    } = rezervPlan;

    const stopIds = rezervStops.map(item => item);



    const lastRezervQuery = `SELECT MAX(rezervationid) as last_rezerv_id FROM bluetour.rezervation`;
    const lastRezervResult = await client.query(lastRezervQuery);
    const newRezervId = parseInt(lastRezervResult.rows[0].last_rezerv_id) + 1;  // ID'yi bir arttırıyoruz


    const rezervationQuery = `
    insert into bluetour.rezervation (rezervationid, appuserid, tourid, rezervcapacity, starttime, endtime, rezervdate, rezervtourtype, rezervprice, isfoodinclude)
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    await client.query(rezervationQuery, [newRezervId, userId, tourId, rezervCapacity, defaultstarttime, defaultendtime, rezervDate, tourtype, tourprice, false]);
    
    if (stopIds.length > 0) {
      const rezervationAllStopsQuery = `
        INSERT INTO bluetour.rezervation_tour_allstops (rezervation_rezervationid, tour_tourid, allstops_stopid)
        VALUES ($1, $2, $3)
      `;
    
      for (const stopId of stopIds) {
        await client.query(rezervationAllStopsQuery, [newRezervId, tourId, stopId]);
      }
    }


    await client.query('COMMIT');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Ödeme işlemi sırasında hata oluştu:", error);
    res.status(500).json({ error: "Ödeme işlemi başarısız", details: error.message });
  } finally {
    client.release();
  }
});

// tarih bloklama endpoint'i
app.post("/api/blockdate", async (req, res) => {
  const { tourId, rezervDate, userId  } = req.body;

  const lastRezervQuery = `SELECT MAX(rezervationid) as last_rezerv_id FROM bluetour.rezervation`;
  const lastRezervResult = await client.query(lastRezervQuery);
  const newRezervId = parseInt(lastRezervResult.rows[0].last_rezerv_id) + 1;  // ID'yi bir arttırıyoruz


  try {
    // Önce tarih blokajını kontrol et
    const blockdatequery = `
      insert into bluetour.rezervation (rezervationid, appuserid, tourid, rezervcapacity, starttime, endtime, rezervdate, rezervtourtype, rezervprice, isfoodinclude)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;

    await pool.query(blockdatequery, [ newRezervId, userId ,tourId, 0 , "00:00:00", "23:59:59", rezervDate, "block", 0, false]);

    res.status(200).json({ message: "Tarih blokajı başarıyla yapıldı" });
  } catch (error) {
    console.error("Tarih blokajı yapılamadı:", error);
    res.status(500).json({ error: "Tarih blokajı yapılamadı", details: error.message });
  }
});

// tarih blokajını kaldırma endpoint'i
app.post("/api/unblockdate", async (req, res) => {
  const { tourId, rezervDate, userId } = req.body;

  try {
    const unblockdatequery = `
      delete from bluetour.rezervation
      where tourid = $1 and rezervdate = $2 and appuserid = $3 and rezervtourtype = 'block' and rezervprice = 0 and rezervcapacity = 0
      `;

    await pool.query(unblockdatequery, [tourId, rezervDate, userId ]);

    res.status(200).json({ message: "Tarih blokajı başarıyla kaldırıldı" });
  } catch (error) {
    console.error("Tarih blokajı kaldırılamadı:", error);
    res.status(500).json({ error: "Tarih blokajı kaldırılamadı", details: error.message });
  }
});


// Tüm durakları getiren endpoint
app.get("/api/stops", async (req, res) => {
  try {
    // Önce durakları al
    const query = `
      SELECT 
        stopid,
        stopname,
        description,
        latitude,
        longitude,
        array_agg(type) as types
      FROM bluetour.appstops 
      GROUP BY stopid, stopname, description, latitude, longitude
    `;
    
    const result = await pool.query(query);
    
    const stops = result.rows.map(stop => ({
      id: stop.stopid,
      name: stop.stopname,
      description: stop.description,
      latitude: parseFloat(stop.latitude),
      longitude: parseFloat(stop.longitude),
      types: stop.types
    }));
    
    res.json(stops);
  } catch (error) {
    console.error("Duraklar getirilirken hata oluştu:", error);
    res.status(500).json({ error: "Duraklar getirilemedi", details: error.message });
  }
});
// Belirli bir durağı getiren endpoint
app.get("/api/stops/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        stopid,
        stopname,
        description,
        latitude,
        longitude,
        array_agg(type) as types
      FROM bluetour.appstops 
      WHERE stopid = $1
      GROUP BY stopid, stopname, description, latitude, longitude
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Durak bulunamadı" });
    }
    
    const stop = {
      id: result.rows[0].stopid,
      name: result.rows[0].stopname,
      description: result.rows[0].description,
      latitude: parseFloat(result.rows[0].latitude),
      longitude: parseFloat(result.rows[0].longitude),
      types: result.rows[0].types
    };
    
    res.json(stop);
  } catch (error) {
    console.error("Durak getirilirken hata oluştu:", error);
    res.status(500).json({ error: "Durak getirilemedi", details: error.message });
  }
});
// tourid'ye göre turun gidebileceği durakları getirir.
app.get("/api/allstops/:tourid", async (req,res) => {
  const  registrationnumber = req.params.tourid;

  try {
    const query = `
      select         stopid,
          stopname,
          description,
          latitude,
          longitude,
          array_agg("type") as types from bluetour.stopoftour
      where boatregistrationnumber = $1
        GROUP BY stopid, stopname, description, latitude, longitude
      order by stopname asc
    `;
    const result = await pool.query(query, [registrationnumber]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Durak bulunamadı" });
    }
    
    // Tüm durakları bir array içinde döndür
    const stops = result.rows.map(row => ({
      id: row.stopid,
      name: row.stopname,
      description: row.description,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      types: row.types
    }));

    res.json(stops);
  } catch (error) {
    console.error("Durak getirilirken hata oluştu:", error);
    res.status(500).json({ error: "Durak getirilemedi", details: error.message });
  }
  
});


// belli bir ilçedeki duraklar getiriliyor.
app.get("/api/countystops/:countyid", async (req,res) => {
  try{
    const { countyid } = req.params; 

    const query = `
      select stopid, stopname, description, latitude, longitude
      from bluetour.allstops
      where stop_countyid = $1  
    `;

    const result = await pool.query(query, [countyid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Durak bulunamadı" });
    }
    
    res.json(result.rows);

  } catch (error) {
    console.log("Error alındı : ", error.message);
  }
})


// Tüm Şehirleri getiren endpoint
app.get("/api/allcity" , async (req, res) => {
  try {
    // Önce durakları al
    const query = `
    SELECT DISTINCT cityid, cityname
    FROM bluetour.city 
    `;
    
    const result = await pool.query(query);
    
    const cities = result.rows.map(city => ({
      id : city.cityid,
      name : city.cityname
    }))
    
    res.json(cities);
  } catch (error) {
    console.error("cities getirilirken hata oluştu:", error);
    res.status(500).json({ error: "Duraklar getirilemedi", details: error.message });
  }
  
});
//Belirli şehirin bütün ilçelerini getiren endpoint
app.get("/api/allcounty/:cityid" , async (req, res) => {
  try {
    
    const { cityid } = req.params;

    const query = `
      SELECT countyid, countyname
      FROM bluetour.county
      where "cityid" = $1 
    `;

    const result = await pool.query(query, [cityid]);

    const counties = result.rows.map(county => ({
      id : county.countyid,
      name : county.countyname
    }))
    
    res.json(counties);
  } catch (error) {
    console.error("counties getirilirken hata oluştu:", error);
    res.status(500).json({ error: "Duraklar getirilemedi", details: error.message });
  }
  
});
// turun gittiği duraklar ekleniyor
app.post("/api/addtourstops/:registrationnumber", async (req, res) => {
    const { registrationnumber } = req.params;
    const { allstopid } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

        // Durakları ekleyelim
        const values = allstopid.map(stopid => `(${registrationnumber}, ${stopid})`).join(", ");

        const postquery = `
            INSERT INTO bluetour.tour_allstops (tour_tourid, allstops_stopid) 
            VALUES ${values}
        `;

        await client.query(postquery);
    await client.query('COMMIT');
        
        res.status(201).json({ message: "Duraklar başarıyla eklendi" });
  } catch (error) {
    await client.query('ROLLBACK');
        console.error("Tour stops kaydedilirken hata oluştu:", error);
        res.status(500).json({ error: "Duraklar eklenemedi", details: error.message });
  } finally {
    client.release();
  }
});



// Context getiren endpoint'i düzeltelim
app.get("/api/context", async (req,res) => {
  try {
    const query = `
    SELECT contextid, contextname
    FROM bluetour.context 
    order by contextname asc
    `;
    
    const result = await pool.query(query);
    
    const contexts = result.rows.map(row => ({
      id: row.contextid,
      name: row.contextname
    }));
    
    res.json(contexts);
  } catch (error) {
    console.error("Context getirilirken hata oluştu:", error);
    res.status(500).json({ error: "Context getirilemedi", details: error.message });
  }
});

// kullanıcı tour'a comment yaptığında.
app.post("/api/votecomment", async (req, res) => {
  const { comment, date, userid, tourid, vote } = req.body;

  if ((!comment || comment.trim() === '') && (vote === null || vote === undefined)) {
    return res.status(400).json({ error: "Yorum veya oy gereklidir." });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Yorum ekle
    if (comment && comment.trim() !== '') {
      const lastCommentQuery = `SELECT MAX(commentid) as last_comment_id FROM bluetour.comment`;
      const lastCommentResult = await client.query(lastCommentQuery);
      const newCommentId = parseInt(lastCommentResult.rows[0].last_comment_id) + 1 || 1;

      const commentQuery = `
        INSERT INTO bluetour.comment (commentid, commenttext, commentdate, appuserid, tourid)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(commentQuery, [newCommentId, comment, date, userid, tourid]);
    }

    // Oy ekle
    if ((vote !== null && vote !== undefined)) {
      const lastVoteQuery = `SELECT MAX(voteid) as last_vote_id FROM bluetour.vote`;
      const lastVoteResult = await client.query(lastVoteQuery);
      const newVoteId = parseInt(lastVoteResult.rows[0].last_vote_id) + 1 || 1;

      const voteQuery = `
        INSERT INTO bluetour.vote (voteid, votescore, votedate, appuserid, tourid)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(voteQuery, [newVoteId, vote, date, userid, tourid]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: "Yorum ve Oy başarıyla kaydedildi" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Yorum ve Oy kaydedilirken hata oluştu:", error);
    res.status(500).json({ error: "Kullanıcı kaydedilemedi", details: error.message });
  } finally {
    client.release();
  }
});



// ads içinde yer alacak verileri getirir
app.get("/api/ads", async (req,res) => {
  try {
    const adsQuery = 
    `
      SELECT 
        a.boatregistrationnumber,
        a.tourname,
        a.countyname,
        a.cityname,
        STRING_AGG(DISTINCT a.tourtype, ',') AS tourtypes,
        STRING_AGG(DISTINCT a.tourprice::text, ',') AS tourprices,
        STRING_AGG(DISTINCT a.feeunit, ',') AS feeunits,
        ROUND(AVG(a.votescore)::numeric, 2) AS average_votescore,
        NOT BOOL_OR(av.rezervdate = CURRENT_DATE) OR BOOL_OR(av.rezervdate IS NULL) AS is_available_today
      FROM bluetour.allads a
      LEFT JOIN bluetour.availability av 
        ON a.boatregistrationnumber = av.boatregistrationnumber
      GROUP BY 
        a.boatregistrationnumber, a.tourname, a.countyname, a.cityname
      ORDER BY 
        a.cityname, a.countyname ASC;
    `
    const result = await pool.query(adsQuery);

    const adsData = result.rows.map(adData => ({
      id : adData.boatregistrationnumber,
      name : adData.tourname, 
      tourtype: adData.tourtypes,
      location: adData.countyname + ', ' + adData.cityname,
      available: adData.is_available_today,
      tourprice: adData.tourpeices,
      feeunit: adData.feeunits,
      reyting: adData.average_votescore === null ? 0 : adData.average_votescore,
    }));
    
    res.json(adsData);
  } catch (error) {
    console.error("cities getirilirken hata oluştu:", error);
    res.status(500).json({ error: "Duraklar getirilemedi", details: error.message });
  }

});



// tour'un description'u update eder.
app.put("/api/updateDescription", async (req, res) => {
  const { registrationnumber, newDescription } = req.body;

  try {
    const query = `
      UPDATE bluetour.tour
      SET description = $1
      WHERE boatregistrationnumber = $2
    `;
    await pool.query(query, [newDescription, registrationnumber]);
    res.status(200).json({ message: "Description başarıyla güncellendi" });
  } catch (error) {
    console.error("Description güncellenirken hata oluştu:", error);
    res.status(500).json({ error: "Description güncellenemedi", details: error.message });
  }
});
// tour contextlerini günceller.
app.put("/api/updateTourContext/:registrationnumber", async (req,res) => {
  try {
    
    const { tourid, lastContextIdList } = req.body;


    // Veritabanından mevcut context ID'lerini alıyoruz
    const contextidQuery = `
      SELECT context_contextid FROM bluetour.tourcontext
      WHERE tour_tourid = $1
    `;
    const result = await pool.query(contextidQuery, [tourid]);

    // Eski context ID'lerini alıyoruz
    const oldContextIds = result.rows.map(row => row.context_contextid);

    // Silinmesi gereken context ID'leri (oldContextIds içinde olup lastContextIdList içinde olmayan)
    const deleting = oldContextIds.filter(id => !lastContextIdList.includes(id));

    // Yeni eklenmesi gereken context ID'leri (lastContextIdList içinde olup oldContextIds içinde olmayan)
    const adding = lastContextIdList.filter(id => !oldContextIds.includes(id));

    // Deleting array'inde her bir ID ile ilgili ikili ilişkiyi silme işlemi yapıyoruz
    const deleteQueries = deleting.map(contextId => {
      return pool.query(`
        DELETE FROM bluetour.tourcontext
        WHERE tour_tourid = $1 AND context_contextid = $2
      `, [tourid, contextId]);
    });

    // Silme işlemini eşzamanlı olarak gerçekleştiriyoruz
    await Promise.all(deleteQueries);

    // Eğer yeni context ID'leri eklemek isteniyorsa, bunu da burada gerçekleştirebiliriz.
    // Eklenen ID'ler için insert işlemi yapılabilir (isteğe bağlı).
    const insertQueries = adding.map(contextId => {
      return pool.query(`
        INSERT INTO bluetour.tourcontext (context_contextid, tour_tourid)
        VALUES ($1, $2)
      `, [contextId, tourid]);
    });

    // Eklemeleri de eşzamanlı olarak gerçekleştiriyoruz
    await Promise.all(insertQueries);

    // Sonuçları döndürüyoruz
    res.json({ message: 'Context ID güncellemeleri başarıyla yapıldı.' });

  } catch (error) {
    console.error("Hata oluştu:", error);
    res.status(500).json({ message: 'Veritabanı işlemi sırasında hata oluştu.' });
  }
});
//tour stops'ları günceller.
app.put("/api/updateTourAllStops/:registrationnumber", async (req,res) => {
  try {
    
    const { tourid, lastTourStops } = req.body;


    // Veritabanından mevcut context ID'lerini alıyoruz
    const tourstopsidQuery = `
      SELECT allstops_stopid FROM bluetour.tour_allstops
      WHERE tour_tourid = $1
    `;
    const result = await pool.query(tourstopsidQuery, [tourid]);

    // Eski context ID'lerini alıyoruz
    const oldStopIds = result.rows.map(row => row.allstops_stopid);

    // Silinmesi gereken context ID'leri (oldContextIds içinde olup lastContextIdList içinde olmayan)
    const deleting = oldStopIds.filter(id => !lastTourStops.includes(id));

    // Yeni eklenmesi gereken context ID'leri (lastContextIdList içinde olup oldContextIds içinde olmayan)
    const adding = lastTourStops.filter(id => !oldStopIds.includes(id));

    // Deleting array'inde her bir ID ile ilgili ikili ilişkiyi silme işlemi yapıyoruz
    const deleteQueries = deleting.map(allstops_stopid => {
      return pool.query(`
        DELETE FROM bluetour.tour_allstops
        WHERE tour_tourid = $1 AND allstops_stopid = $2
      `, [tourid, allstops_stopid]);
    });

    // Silme işlemini eşzamanlı olarak gerçekleştiriyoruz
    await Promise.all(deleteQueries);

    // Eğer yeni context ID'leri eklemek isteniyorsa, bunu da burada gerçekleştirebiliriz.
    // Eklenen ID'ler için insert işlemi yapılabilir (isteğe bağlı).
    const insertQueries = adding.map(allstops_stopid => {
      return pool.query(`
        INSERT INTO bluetour.tour_allstops (tour_tourid, allstops_stopid)
        VALUES ($1, $2)
      `, [tourid, allstops_stopid]);
    });

    // Eklemeleri de eşzamanlı olarak gerçekleştiriyoruz
    await Promise.all(insertQueries);

    // Sonuçları döndürüyoruz
    res.json({ message: 'Context ID güncellemeleri başarıyla yapıldı.' });

  } catch (error) {
    console.error("Hata oluştu:", error);
    res.status(500).json({ message: 'Veritabanı işlemi sırasında hata oluştu.' });
  }
});
// like ve dislike'ı günceller.
app.post("/api/postenjoyment", async(req,res) => {
  const { userId, tourId, liked, disliked } = req.body;

  try {
    let enjoyment = null;
    if (liked) {
      enjoyment = 1;
    } else if (disliked) {
      enjoyment = 0;
    }
    
    if (enjoyment === null) {
      // Kullanıcının daha önce bu tur için bir önerisi var mı kontrol et
      const checkQuery = `
        SELECT enjoymentid FROM bluetour.enjoyment
        WHERE appuserid = $1 AND tourid = $2
      `;
      const checkResult = await pool.query(checkQuery, [userId, tourId]);
    
      if (checkResult.rows.length > 0) {
        // Kayıt varsa sil
        const deleteQuery = `
          DELETE FROM bluetour.enjoyment
          WHERE appuserid = $1 AND tourid = $2
        `;
        await pool.query(deleteQuery, [userId, tourId]);
        return res.status(200).json({ message: "Öneri kaldırıldı." });
      } else {
        // Kayıt yoksa sadece hata döndür
        return res.status(400).json({ error: "Geçersiz istek: liked veya disliked belirtin." });
      }
    }
  
    const enjoymentdate = new Date().toISOString();
  
    // 1. Daha önce bu kullanıcı ve tur için kayıt yapılmış mı kontrol et
    const checkQuery = `
      SELECT enjoymentid FROM bluetour.enjoyment
      WHERE appuserid = $1 AND tourid = $2
    `;
    const checkResult = await pool.query(checkQuery, [userId, tourId]);
  
    if (checkResult.rows.length > 0) {
      // 2. Varsa güncelle
      const existingId = checkResult.rows[0].enjoymentid;
      const updateQuery = `
        UPDATE bluetour.enjoyment
        SET enjoyment = $1, enjoymentdate = $2
        WHERE enjoymentid = $3
      `;
      await pool.query(updateQuery, [enjoyment, enjoymentdate, existingId]);
  
      return res.status(200).json({ message: "Öneri güncellendi." });
    } else {
      // 3. Yoksa yeni kayıt oluştur
      const lastEnjoymentIdQuery = `SELECT MAX(enjoymentid) as last_enjoyment_id FROM bluetour.enjoyment`;
      const lastEnjoymentIdResult = await pool.query(lastEnjoymentIdQuery);
      const newEnjoymentId = (parseInt(lastEnjoymentIdResult.rows[0].last_enjoyment_id) || 0) + 1;
  
      const insertQuery = `
        INSERT INTO bluetour.enjoyment (enjoymentid, enjoyment, enjoymentdate, appuserid, tourid)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await pool.query(insertQuery, [newEnjoymentId, enjoyment, enjoymentdate, userId, tourId]);
  
      return res.status(201).json({ message: "Öneri başarıyla kaydedildi." });
    }
  } catch (error) {
    console.error("Öneri kaydedilirken hata oluştu:", error);
    res.status(500).json({ error: "Öneri kaydedilemedi", details: error.message });
  }
});

// filtrelemedeki opsiyonları getirir.
app.get('/api/filter-options', async (req, res) => {
  try {
    const [cities, counties, tourTypes, boatTypes, contexts, capacities] = await Promise.all([
      pool.query(`SELECT DISTINCT cityname FROM bluetour.allads order by cityname asc`),  //allads
      pool.query(`SELECT DISTINCT countyname FROM bluetour.allads order by countyname asc`),  //allads
      pool.query(`SELECT DISTINCT tourtype FROM bluetour.allads order by tourtype asc`),  //allads
      pool.query(`SELECT DISTINCT boattype FROM bluetour.boattype order by boattype asc`),  //boatofcaptain
      pool.query(`SELECT DISTINCT contextname FROM bluetour.context order by contextname asc`),    //context
      pool.query(`SELECT max(tourcapacity) as max_capacity FROM bluetour.plan`),  //Maksimum kapasiteyi al
    ]);
    res.json({
      city: cities.rows.map(r => r.cityname),
      county: counties.rows.map(r => r.countyname),
      tourType: tourTypes.rows.map(r => r.tourtype),
      boatType: boatTypes.rows.map(r => r.boattype),
      context: contexts.rows.map(r => r.contextname),
      capacity: Array.from({ length: capacities.rows[0]?.max_capacity || 0 }, (_, i) => i + 1), // 1'den maksimum kapasiteye kadar dizi oluştur
      foodSituation: ['Yes', 'No'],
    });

  } catch (error) {
    console.error("Filtre verileri alınamadı:", error);
    res.status(500).json({ error: "Filtre verileri alınamadı." });
  }
});
// filtreleme yapar ve uygun olanların idleri getirir.
app.post('/api/filter-tours', async (req, res) => {
  const {
    city = [],
    county = [],
    tourType = [],
    boatType = [],
    context = [],
    capacity = [],
    foodSituation = [],
    date = [],
    stops = []
  } = req.body;

  const values = [];
  const whereClauses = [];

  // Şehir filtresi - OR gate
  if (city.length > 0) {
    whereClauses.push(`(cityname = ANY($${values.length + 1}))`);
    values.push(city);
  }

  // İlçe filtresi - OR gate
  if (county.length > 0) {
    whereClauses.push(`(countyname = ANY($${values.length + 1}))`);
    values.push(county);
  }

  // Tur tipi filtresi - OR gate
  if (tourType.length > 0) {
    // TourType değerlerini PostgreSQL array formatına dönüştür
    const tourTypeArray = `{${tourType.map(t => t.replace(/"/g, '')).join(',')}}`;
    whereClauses.push(`(tourtype @> $${values.length + 1}::text[])`);
    values.push(tourTypeArray);
  }

  // Tekne tipi filtresi - OR gate
  if (boatType.length > 0) {
    whereClauses.push(`(boattype = ANY($${values.length + 1}))`);
    values.push(boatType);
  }

  // Context filtresi - AND gate
  if (context.length > 0) {
    // Context değerlerini PostgreSQL array formatına dönüştür
    const contextArray = `{${context.map(c => c.replace(/"/g, '')).join(',')}}`;
    whereClauses.push(`(contextname @> $${values.length + 1}::text[])`);
    values.push(contextArray);
  }

  // Kapasite filtresi - OR gate
  if (capacity.length > 0) {
    const capacityClauses = capacity.map(cap => {
        values.push(cap);
        return `EXISTS (SELECT 1 FROM unnest(capacity) AS c WHERE c >= $${values.length})`;
    });
    whereClauses.push(`(${capacityClauses.join(' OR ')})`);
  }

  // Yemek durumu filtresi - OR gate
  if (foodSituation.length > 0) {
    whereClauses.push(`(foodstate = ANY($${values.length + 1}))`);
    values.push(foodSituation);
  }

  // Tarih filtresi - array içinde arama
  if (date.length > 0) {
    whereClauses.push(`(rezervdate @> $${values.length + 1}::date[])`);
    values.push(date);
  }

  // Durak filtresi - array içinde arama
  if (stops.length > 0) {
    whereClauses.push(`(stopids @> $${values.length + 1}::int[])`);
    values.push(stops);
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const query = `
    SELECT DISTINCT boatregistrationnumber
    FROM bluetour.filtreview
    ${whereSQL}
    ORDER BY boatregistrationnumber;
  `;

  try {
    const result = await pool.query(query, values);
    const tourIds = result.rows.map(row => row.boatregistrationnumber);
    res.json(tourIds);
  } catch (err) {
    console.error('Filter error:', err);
    res.status(500).json({ error: 'Server error while filtering boats' });
  }
});
// search bar'da arama yapılır.
app.get('/api/search-boats', async (req, res) => {
  const { search } = req.query;

  try {
    const query = `
      SELECT DISTINCT t.boatregistrationnumber
      FROM bluetour.tour AS t
      LEFT JOIN bluetour.countyofcity AS coc
        ON t.countyid = coc.countyid
      WHERE 
        LOWER(t.tourname) LIKE LOWER('%' || $1 || '%')
        OR LOWER(coc.cityname) LIKE LOWER('%' || $1 || '%')
        OR LOWER(coc.countyname) LIKE LOWER('%' || $1 || '%')
      ORDER BY t.boatregistrationnumber;
    `;

    const result = await pool.query(query, [search]);
    const tourIds = result.rows.map(row => row.boatregistrationnumber);
    res.json(tourIds);
  } catch (err) {
    console.error('Arama hatası:', err);
    res.status(500).json({ error: 'Tekneler aranırken sunucu hatası oluştu' });
  }
});



// Sunucuyu başlat
app.listen(port, '0.0.0.0', () => {
  console.log(`Server ${port} portunda çalışıyor...`);
});

module.exports = { pool };