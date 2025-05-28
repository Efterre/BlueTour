copy bluetour.city (cityid,cityname)
FROM 'C:/Users/Emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/cities.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');

copy bluetour.county (countyid, countyname, cityid)
FROM 'C:/Users/Emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/county.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');

COPY bluetour.allstops (stopid, stopname, description, latitude, longitude, stop_countyid)
FROM 'C:/Users/Emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/stops.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');

copy bluetour.stoptype (stoptype_id, "type")
FROM 'C:/Users/emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/stop_type.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');

copy bluetour.appuser (userid, usertype,useremail,username,userphone,userpassword)
FROM 'C:/Users/Emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/user.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');

SELECT setval('bluetour.appuser_userid_seq', COALESCE(MAX(userid), 1) + 1, false) FROM bluetour.appuser;

insert into bluetour.appuser (usertype,useremail, username,userphone,userpassword)
values (0, 'adminuser@gmail.com','adminuser', '41332707', 'adminuser_1903') ,
 (1,'admincaptain@gmail.com','admincaptain', '41332707', 'admincaptain_1903');

copy bluetour.captainuser (appuserid,bancount,iswork)
FROM 'C:/Users/Emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/captain.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');

insert into bluetour.captainuser (appuserid, bancount, iswork)
values (12, 3, true);

copy bluetour.boattype (boattypeid,boattype)
FROM 'C:/Users/Emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/boatType.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');

copy bluetour.material (materialid,materialname)
FROM 'C:/Users/Emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/material.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');


copy bluetour.boat (registrationnumber, captainid,boatname,boattypeid,manufacturematerial,taxnumber,taxoffice, boundport)
FROM 'C:/Users/Emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/boat.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');

insert into bluetour.boat (registrationnumber, captainid, boatname, boattypeid, manufacturematerial, 
taxnumber, taxoffice, boundport)
values (1903527 , 12, 'Octopus', 1, 1, 1010101010, 'Ayvalık', 'Ayvalık');

copy bluetour.tour (boatregistrationnumber,tourname, isdivingtour, isfishingtour,isdailytour,
isovernighttour, isspecialtour,capacity, foodstate, isavaliable, 
foodpriceperperson, foodprice,description, countyid)
FROM 'C:/Users/Emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/tour.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');


insert into bluetour.tour (boatregistrationnumber,tourname, isdivingtour, isfishingtour,isdailytour,
isovernighttour, isspecialtour,capacity, foodstate, isavaliable,
foodpriceperperson, foodprice, description, countyid)
values ( 1903527,'Kanadalı Tur', false,false,true,true,true,10,true,true,500, 4000,
null, 1);


INSERT INTO bluetour.tour_allstops (tour_tourid, allstops_stopid)
OVERRIDING SYSTEM VALUE
VALUES (1903527,1),(1903527,2),(1903527,4),(1903527,6),(1903527,11),(1903527,19);

insert into bluetour.allstops_stoptype (allstops_stopid, stoptype_stoptype_id)
values(1,1),(2,1),(2,3),(3,1),(3,2),(4,1),(5,1),(6,1),(7,1),(8,2),(8,3),(9,2),(9,3),
(10,1),(11,1),(11,2),(11,3),(12,1),(13,1),(14,1),(14,3),(15,1),(15,2),(15,3),(16,1),
(16,2),(16,3),(17,1),(17,2),(17,3),(18,1),(19,1);

copy bluetour.tour_allstops (tour_tourid,allstops_stopid)
FROM 'C:/Users/Emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/tour_allstop.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');

COPY bluetour.rezervation (rezervationid,appuserid, tourid, rezervcapacity, starttime, endtime, rezervdate, rezervtourtype, rezervprice, isfoodinclude)
FROM 'C:/Users/Emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/rezervation.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');

SELECT setval('bluetour.rezervation_rezervationid_seq', COALESCE(MAX(rezervationid), 1) + 1, false) FROM bluetour.rezervation;

insert into bluetour.rezervation (appuserid,tourid,rezervcapacity, starttime, endtime, rezervdate, rezervtourtype, rezervprice, isfoodinclude )
values (5,1903527,5,'10:00:00','18:00:00','2025-07-30','daily', 15000, true),
(9,1903527,2,'10:00:00','18:00:00','2025-08-12','daily', 15000, false),
(1,1903527,3,'18:00:00','09:00:00','2024-08-15','overnight', 20000, true);

copy bluetour.rezervation_tour_allstops (rezervation_rezervationid,tour_tourid,allstops_stopid)
FROM 'C:/Users/Emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/rezervation_stops.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');

copy bluetour.context (contextid,contextname)
FROM 'C:/Users/Emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/context.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');

COPY bluetour.plan(plantourid, tourtype, tourcapacity, defaultstarttime, defaultendtime, tourprice, feeunit)
FROM 'C:/Users/Emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/planoftour.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');

copy bluetour.tourcontext (tour_tourid,context_contextid)
FROM 'C:/Users/Emrey/Desktop/Projects/react_native_project/BlueTour/test_dataset/tourcontext.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');

insert into bluetour.tourcontext (context_contextid, tour_tourid)
values (5,1903527),(12,1903527),(13,1903527);


insert into bluetour.plan(plantourid, tourtype, tourcapacity, defaultstarttime, defaultendtime, tourprice, feeunit )
values (1903527, 'fishing', 8, '05:00:00','14:00:00',600,'USD'),
(1903527, 'daily', 12, '10:00:00','19:00:00',2000,'USD');

SELECT setval('bluetour.appuser_userid_seq', COALESCE(MAX(userid), 1) + 1, false) FROM bluetour.appuser;

insert into bluetour.appuser ( usertype, useremail, username, userphone, userpassword)
values (0, 'unknownuser@efterre.com', 'unknownadmin', '0000000000', '1234UkA!');