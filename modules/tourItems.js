class tourItems {
    constructor (photo , tourName , captainName , captainPhone , boatType , capacity , foodSituation , stopList ,feeRentTour , feePerPerson , feePerHour , unitType , comments , likeCount , rating , reportCount , reservations  ) // commentler stack olarak gelecek. , rezervations linkedList gelecek ve takvime işlenecek
    {
        this._photo = photo;
        this._tourName = tourName;
        this._captainName = captainName;
        this._captainPhone = captainPhone;
        this._boatType = boatType;
        this._capacity = capacity;
        this._foodSituation = foodSituation;
        this._stopList = stopList;
        this._feeRentTour = feeRentTour;
        this._feePerPerson = feePerPerson;
        this._feePerHour = feePerHour;
        this._unitType = unitType;
        this._comments = comments; // Yığın (stack) olarak kullanılacak
        this._likeCount = likeCount;
        this._rating = rating;
        this._reportCount = reportCount;
        this._reservations = reservations;
    };

    // Getter and Setter for photo
    get photo() {
        return this._photo;
    }

    set photo(value) {
        this._photo = value;
    }

    // Getter and Setter for tourName
    get tourName() {
        return this._tourName;
    }

    set tourName(value) {
        this._tourName = value;
    }

    // Getter and Setter for captainName
    get captainName() {
        return this._captainName;
    }

    set captainName(value) {
        this._captainName = value;
    }

    // Getter and Setter for captainPhone
    get captainPhone() {
        return this._captainPhone;
    }

    set captainPhone(value) {
        this._captainPhone = value;
    }

    // Getter and Setter for boatType
    get boatType() {
        return this._boatType;
    }

    set boatType(value) {
        this._boatType = value;
    }

    // Getter and Setter for capacity
    get capacity() {
        return this._capacity;
    }

    set capacity(value) {
        this._capacity = value;
    }

    // Getter and Setter for foodSituation
    get foodSituation() {
        return this._foodSituation;
    }

    set foodSituation(value) {
        this._foodSituation = value;
    }

    // Getter and Setter for stopList
    get stopList() {
        return this._stopList;
    }

    set stopList(value) {
        this._stopList = value;
    }

    // Getter and Setter for feeRentTour
    get feeRentTour() {
        return this._feeRentTour;
    }

    set feeRentTour(value) {
        this._feeRentTour = value;
    }

    // Getter and Setter for feePerPerson
    get feePerPerson() {
        return this._feePerPerson;
    }

    set feePerPerson(value) {
        this._feePerPerson = value;
    }

    // Getter and Setter for feePerHour
    get feePerHour() {
        return this._feePerHour;
    }

    set feePerHour(value) {
        this._feePerHour = value;
    }

    // Getter and Setter for unitType
    get unitType() {
        return this._unitType;
    }

    set unitType(value) {
        this._unitType = value;
    }

    // Getter and Setter for comments
    get comments() {
        return this._comments;
    }

    set comments(value) {
        this._comments = value;
    }

    // Getter and Setter for likeCount
    get likeCount() {
        return this._likeCount;
    }

    set likeCount(value) {
        this._likeCount = value;
    }

    // Getter and Setter for rating
    get rating() {
        return this._rating;
    }

    set rating(value) {
        this._rating = value;
    }

    // Getter and Setter for reportCount
    get reportCount() {
        return this._reportCount;
    }

    set reportCount(value) {
        this._reportCount = value;
    }

    // Getter and Setter for reservations
    get reservations() {
        return this._reservations;
    }

    set reservations(value) {
        this._reservations = value;
    }

}

module.exports = tourItems;