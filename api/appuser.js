// import express from 'express';
// const db = require('../api/dbConnection/connection');

// const router = express.Router();

// router.post('/addUser', (req, res) => {
//     const {username , usermail , userphone , userpassword } = req.body;
    
//     const query = "insert into bluetour.appuser (userName, userEmail, userPhone, userPassword, userType) values (?, ?, ?, ?, 0)";
//     db.query(query, [username, usermail, userphone, userpassword], (error, results) => {
//         if (error) {
//             console.error('addition error:', error);
//             return res.status(500).json({ error: 'addition error' });
//         }
//         console.log('User added successfully:', results.insertId);
//         res.status(201).json({ message: 'User added successfully', userId: results.insertId });
//     });
// });

// router.get('/user/userType', (req,res) => {
//     const userType = 0;
//     const query = "select username from appuser where userType = ?";
//     db.query(query,[userType], (error,results) => {
//         if (error) {
//             console.error('getting error:', error);
//             return res.status(500).json({ error: 'getting error' });
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ error: 'user undefined' });
//         }
//         res.status(200).json(results[0]); 
//     });
// });

// module.exports = router;