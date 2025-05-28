create view bluetour.appstops as -- duraklara stoptypeları ekliyoruz.
select als.stopid,als.stopname,als.description, als.latitude, als.longitude ,st.type
from bluetour.allstops as als
left join bluetour.allstops_stoptype as alsst 
on als.stopid = alsst.allstops_stopid
left join bluetour.stoptype as st
on alsst.stoptype_stoptype_id = st.stoptype_id;

select * from bluetour.appstops;

SELECT -- stop attributeları gruplandırıp stopstye'ları array haline getirip tek satıra indiriyoruz. bu array app'te kullanılıyor.
stopid as id,
stopname as name,
description,
latitude::float as latitude,
longitude::float as longitude,
array_agg("type") as types
FROM bluetour.appstops s
GROUP BY stopid, stopname, description, latitude, longitude;

create view bluetour.stopoftour as
select tour_tourid as boatregistrationnumber, stopid, latitude, longitude, "type" ,  from bluetour.tour_allstops as tas
left join bluetour.allstops as als on tas.allstops_stopid = als.stopid
left join bluetour.allstops_stoptype as alsst 
on als.stopid = alsst.allstops_stopid
left join bluetour.stoptype as st
on alsst.stoptype_stoptype_id = st.stoptype_id;


create view bluetour.rezervoftourofcaptain as -- rezervasyondaki tur, kaptan ve kullanıcıyı alıyoruz.
select b.captainid, au.username as captainname , au.userphone as captainphone, 
rz.appuserid, auu.username, auu.userphone, 
t.boatregistrationnumber, t.tourname, 
rz.rezervationid, rz.rezervcapacity, rz.starttime, rz.endtime, rz.rezervdate, rz.rezervtourtype, rz.rezervprice
from bluetour.rezervation as rz
left join bluetour.tour as t
	on rz.tourid = t.boatregistrationnumber
left join bluetour.boat as b
	on t.boatregistrationnumber = b.registrationnumber
left join bluetour.captainuser as cu
	on b.captainid = cu.appuserid
left join bluetour.appuser as au
	on cu.appuserid = au.userid
left join bluetour.appuser as auu
	on rz.appuserid = auu.userid;

create view bluetour.boatofcaptain as -- tekne özellikleri ile captain'a ait bilgileri bir araya getiren view
select captainid , username, useremail, userphone , userpassword, 
registrationnumber, boatname, boundport, boattype, materialname, taxnumber, taxoffice
from bluetour.boat as b
left join bluetour.boattype as bt
on b.boattypeid = bt.boattypeid
left join bluetour.material as m
on b.manufacturematerial = m.materialid
left join bluetour.captainuser as cu
on b.captainid = cu.appuserid
left join bluetour.appuser as au 
on cu.appuserid = au.userid;

select * from bluetour.boatofcaptain;

create view bluetour.captainandstopoftour as -- tour'u gittiği duraklar, şehir, kaptan, bir araya geliyor. 
select captainid , username, useremail, userphone , userpassword, 
boatregistrationnumber, tourname, p.tourtype, p.tourcapacity, foodstate, foodprice, feeunit, t.description as tourdescription,
countyname, cityname , stopname , als.description as stopdescription
from bluetour.tour as t
left join bluetour.boat as b
on t.boatregistrationnumber = b.registrationnumber
left join bluetour.captainuser as cu
on b.captainid = cu.appuserid
left join bluetour.appuser as au 
on cu.appuserid = au.userid
left join bluetour.county as co
on t.countyid = co.countyid
left join bluetour.city as ci
on co.cityid = ci.cityid
left join bluetour.tour_allstops as tas
on t.boatregistrationnumber = tas.tour_tourid
left join bluetour.allstops as als
on tas.allstops_stopid = als.stopid
left join bluetour.plan as p
on t.boatregistrationnumber = p.plantourid;

select * from bluetour.rezervoftourofcaptain;

create view bluetour.allads as -- uygulamada ilanda gözükecek olan atts.
select boatregistrationnumber, tourname , countyname, cityname, p.tourtype,
capacity, tourprice, feeunit , avg(votescore)
from bluetour.tour as t
left join bluetour.county as co on t.countyid = co.countyid
left join bluetour.city as ci on co.cityid = ci.cityid 
left join bluetour.plan as p on t.boatregistrationnumber = p.plantourid
left join bluetour.vote as v on t.boatregistrationnumber = v.tourid;

select * from bluetour.allads;

create view bluetour.availability as -- toura ait olan bütün rezervlerin tarihlerini alıyoruz.
select t.boatregistrationnumber, rezervationid, rezervdate
from bluetour.tour as t
left join bluetour.rezervation as rz
on t.boatregistrationnumber = rz.tourid;

select * from bluetour.availability;

create view bluetour.rezervoftour as -- kullanıcının gittiği turları gösteren view
select au.userid, au.username, t.boatregistrationnumber, t.tourname, rz.rezervdate, rz.rezervtourtype, rz.rezervcapacity, rz.rezervprice
from bluetour.rezervation as rz
left join bluetour.tour as t
on rz.tourid = t.boatregistrationnumber
left join bluetour.appuser as au
on rz.appuserid = au.userid
where usertype = 0;-- and userid=a;

create view bluetour.captainrezervations as -- captain'a ait rezervations detayları
select 
	b.captainid, t.boatregistrationnumber, 
	a.userid, a.username, 
	rz.rezervationid, rz.rezervcapacity, 
	rz.starttime, rz.endtime, rz.rezervdate,
	rz.rezervtourtype, rz.isfoodinclude,
	rz.rezervprice
from bluetour.boat as b 
left join bluetour.tour as t 
on b.registrationnumber = t.boatregistrationnumber
left join bluetour.captainuser as cu 
on b.captainid = cu.appuserid 
left join bluetour.rezervation as rz 
on t.boatregistrationnumber = rz.tourid
left join bluetour.appuser as a 
on rz.appuserid = a.userid;
-- where captainid = a;

create view bluetour.countyofcity as  -- şehirlerin ilçeleri
select ci.cityid, cityname, countyid, countyname , co.cityid as countycityid from bluetour.city as ci
left join bluetour.county as co
on ci.cityid = co.cityid;

create view bluetour.tourpage as -- tourpage de yer alacak bütün attribute'lar burada yer almalı.
select t.boatregistrationnumber , t.tourname, co.countyname,
p.tourtype, p.tourcapacity, p.defaultstarttime, p.defaultendtime, p.tourprice, p.feeunit ,
cx.contextname, --t.is... tur tipleri ile birlikte başlangıç ve bitiş saati.
t.description , -- t.price tour type'a göre fiyat
t.foodstate
from bluetour.tour as t
left join bluetour.plan as p on t.boatregistrationnumber = p.plantourid
left join bluetour.county as co on t.countyid = co.countyid
left join bluetour.city as ci on co.cityid = ci.cityid
left join bluetour.tourcontext as tc on t.boatregistrationnumber = tc.tour_tourid
left join bluetour.context as cx on tc.context_contextid = cx.contextid;

create view bluetour.filtreview as
SELECT 
    t.boatregistrationnumber, 
    t.foodstate, 
    coc.countyname, 
    coc.cityname, 
    boattype, 
    ARRAY_AGG(DISTINCT REPLACE(REPLACE(contextname, '"', ''), '""', '')) AS contextname, 
    ARRAY_AGG(DISTINCT REPLACE(REPLACE(tourtype, '"', ''), '""', '')) AS tourtype, 
    ARRAY_AGG(DISTINCT capacity) AS capacity,  
    ARRAY_AGG(DISTINCT rezervdate) AS rezervdate,   
    ARRAY_AGG(DISTINCT sot.stopid) AS stopids
FROM bluetour.tour AS t
LEFT JOIN bluetour.countyofcity AS coc 
    ON t.countyid = coc.countyid
LEFT JOIN bluetour.boatofcaptain AS boc
    ON t.boatregistrationnumber = boc.registrationnumber
LEFT JOIN bluetour.tourpage AS tg
    ON t.boatregistrationnumber = tg.boatregistrationnumber
LEFT JOIN bluetour.captainrezervations AS cr
    ON t.boatregistrationnumber = cr.boatregistrationnumber
LEFT JOIN bluetour.stopoftour AS sot
    ON t.boatregistrationnumber = sot.boatregistrationnumber
GROUP BY 
    t.boatregistrationnumber, 
    coc.countyname, 
    coc.cityname, 
    boattype, 
    t.foodstate;