SELECT setval('bluetour.appuser_userid_seq', COALESCE(MAX(userid), 1) + 1, false) FROM bluetour.appuser;

insert into bluetour.appuser (usertype, username,useremail,userphone,userpassword)
values (0, 'adminuser','adminuser@gmail.com', '41332707', 'adminuser_1903') ,
 (1,'admincaptain','admincaptain@gmail.com', '41332707', 'admincaptain_1903');

insert into bluetour.captainuser (appuserid, bancount, iswork)
values (24, 3, true);

insert into bluetour.boat (registrationnumber, boatname, boattypeid, manufacturematerial, 
taxnumber, taxoffice)
values (1903527, 'Octopus', 1, 1, 1010101010, 'Ayvalık');

SELECT setval('bluetour.tour_tourid_seq', COALESCE(MAX(tourid), 1) + 1, false) FROM bluetour.tour;

insert into bluetour.tour (tourname, isdivingtour, isfishingtour,isdailytour,
isovernighttour, isspecialtour,capacity, foodstate, isavaliable, feerenttour,feeperperson,
feeperhour, feeunit, boatregistrationnumber, captainuserid, countyid)
values ('Kanadalı Tur', false,false,true,true,true,10,true,true,14000, 2000, 4000, 
'TRY', 1903527, 24, 1);

INSERT INTO bluetour."tour_allStops" (tour_tourid, "allStops_stopID")
OVERRIDING SYSTEM VALUE
values (11,1),(11,2),(11,4),(11,6),(11,11),(11,19);