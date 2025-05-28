use bluetour;

SELECT VERSION();


SELECT user, host, plugin FROM mysql.user WHERE user = 'root';

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Rs.27;rQ';

SHOW GRANTS FOR 'root'@'localhost';

GRANT ALTER, UPDATE ON *.* TO 'root'@'localhost';

FLUSH PRIVILEGES;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Rs.27;rQ';

SHOW PLUGINS;

alter table captainuser
add column isWork TINYINT;

alter table boat
add column manufacturingMaterial integer;

select * from bluetour.appuser;
select * from bluetour.captainuser;
select * from bluetour.boatype;
select * from bluetour.boat;
select * from bluetour.tour;



