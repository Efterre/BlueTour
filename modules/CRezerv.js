class CRezerv {

    constructor(rezervid, tourID, captainID, userid, username, rezervcapacity,
        tourtype, rezervdate, starttime, endtime, isfoodinclude, rezervprice) {
        this.rezervid = rezervid;
        this.tourID = tourID;
        this.captainID = captainID;
        this.userid = userid;
        this.username = username;
        this.capacity = rezervcapacity;
        this.tourtype = tourtype;
        this.date = rezervdate.split('T')[0];
        this.starttime = starttime;
        this.endtime = endtime;
        this.isfoodinclude = isfoodinclude;
        this.rezervprice = rezervprice;
}

};
//This ad is in flatlist
module.exports = CRezerv;