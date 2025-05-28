class ad {

    constructor (id , photo , tourname, tourType, location, availability, feetour , unitType, reyting  ) {
        this.tourID = id;
        this.photoURLs = photo;
        this.tourName = tourname;
        this.tourTypes = tourType;
        this.location = location;
        this.isAvailable = availability;
        this.tourprice = feetour;
        this.unitType = unitType;
        this.reyting = reyting ;
    }
};
//This ad is in flatlist
module.exports = ad;