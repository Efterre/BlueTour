// const express = require('express');
// const router = express.Router();

// const db = require('./dbConnection/connection.js');

// const fetchAds = async () => {
//     try {
//       const [rows] = await db.query('SELECT tourID, tourName, isDivingTour, isFishingTour, isDailyTour, isOverNightTour, isSpecialTour , location, isAvaliable, feeRentTour, feePerPerson, feePerHour , feeUnit FROM tour');
      
//       return rows.map((row) => new Ad(row.tourID, row.photo=null, row.tourName, row.tourType=[row.isDivingTour,row.isFishingTour,row.isDailyTour,row.isOverNightTour,row.isSpecialTour], row.location, row.isAvaliable, row.feeRentTour, row.feePerPerson, row.feePerHour, row.unitType));
//     } catch (error) {
//       console.error('Fetch Data Error:', error);
//       throw error;
//     }
//   };
  
// module.exports = { fetchAds };