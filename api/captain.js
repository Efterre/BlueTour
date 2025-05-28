// const express = require('express');
// const router = express.Router();

// const db = require('../dbConnection/connection.js');

// function addCaptain (email,phone,username,password, isWork) {
//     const query = "insert into bluetour.appuser (userName,userEmail,userPhone,userPassword,userType) values (?,?,?,?,1)";
//     db.query(query, [username,email,phone,password], (error,results) => {
//         if (error) {
//             console.error('User eklenirken hata oluştu:', error);
//             return;
//         }

//         const captainID = results.insertId;

//         const captainQuery = "insert into bluetour.captainuser (appUser_userID, banCount, isWork) values (?,0,?)"

//         db.query(captainQuery, [captainID, isWork] , (captainError, captainResult) => {
//             if (captainError) {
//                 console.error('User eklenirken hata oluştu:', captainError);
//                 return;
//             }
//         })

//         console.log('User added succesfully:', captainResult.insertId);
//     });
// };

// module.exports = { addCaptain };