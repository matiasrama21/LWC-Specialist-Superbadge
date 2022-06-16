import { LightningElement, api, wire } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// imports
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

export default class BoatsNearMe extends LightningElement {
    @api boatTypeId;
    mapMarkers = [];
    isLoading = true;
    isRendered = false;
    latitude;
    longitude;

    @wire(getBoatsByLocation, { latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId' })
    wiredBoatsJSON({ error, data }) {
        if (data) {
            this.createMapMarkers(JSON.parse(data));
        } else if (error) {
            // Set message error
            let message = 'Unknown error';
            if (Array.isArray(error.body)) {
                message = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                message = error.body.message;
            }
            // ShowToastEvent
            this.dispatchEvent(new ShowToastEvent({
                title: ERROR_TITLE,
                message: message,
                variant: ERROR_VARIANT
            }));
        }

        this.isLoading = false;
    }

    // Controls the isRendered property
    // Calls getLocationFromBrowser()
    renderedCallback() {
        if (!this.isRendered) {
            this.getLocationFromBrowser();
            this.isRendered = true;
        }
    }

    // Gets the location from the Browser
    // position => {latitude and longitude}
    getLocationFromBrowser() {
        navigator.geolocation.getCurrentPosition(
            position => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
            },
            error => {
                console.warn('ERROR(' + error.code + '): ' + error.message);
            }
        );
    }

    // Creates the map markers
    createMapMarkers(boatData) {
        // const newMarkers = boatData.map(boat => {...});
        const newMarkers = boatData.map(boat => {
            return {
                location: {
                    Latitude: boat.Geolocation__Latitude__s,
                    Longitude: boat.Geolocation__Longitude__s,
                },
                title: boat.Name,
            };
        });

        // newMarkers.unshift({...});
        newMarkers.unshift({
            location: {
                Latitude: this.latitude,
                Longitude: this.longitude,
            },
            title: LABEL_YOU_ARE_HERE,
            icon: ICON_STANDARD_USER,
        });

        this.mapMarkers = newMarkers;
    }
}
