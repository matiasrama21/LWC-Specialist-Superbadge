import { LightningElement, api, wire } from 'lwc';

// imports
export default class BoatReviews extends LightningElement {
    // Private
    boatId;
    error;
    boatReviews;
    isLoading;

    // Getter and Setter to allow for logic to run on recordId change
    get recordId() {
        return this.boatId;
    }

    @api
    set recordId(value) {
        //sets boatId attribute
        this.setAttribute('boatId', value);
        //sets boatId assignment
        this.boatId = value;
        //get reviews associated with boatId
        this.getReviews();
    }

    // Getter to determine if there are reviews to display
    get reviewsToShow() {
        return this.boatReviews ? true : false;
    }

    // Public method to force a refresh of the reviews invoking getReviews
    @api
    refresh() { }

    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.
    getReviews() { }

    // Helper method to use NavigationMixin to navigate to a given record on click
    navigateToRecord(event) { }
}
