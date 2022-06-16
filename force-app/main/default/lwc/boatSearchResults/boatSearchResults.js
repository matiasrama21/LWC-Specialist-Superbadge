import { LightningElement, wire, api } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import {
    publish,
    MessageContext,
} from 'lightning/messageService';
import BoatMC from '@salesforce/messageChannel/BoatMessageChannel__c';

// ...
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
    selectedBoatId;
    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text', editable: true },
        { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
        { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
        { label: 'Description', fieldName: 'Description__c', type: 'text', editable: true }
    ];
    boatTypeId = '';
    boats;
    isLoading = false;
    draftValues = [];

    // wired message context
    @wire(MessageContext)
    messageContext;

    // wired getBoats method
    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats(result) {
        if (result.data) {
            this.boats = result;
            this.notifyLoading(false);
        } else if (result.error) {
            this.boats = undefined;
        }
    }

    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api
    searchBoats(boatTypeId) {
        this.notifyLoading(true);
        this.boatTypeId = boatTypeId;
    }

    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    @api
    async refresh() {
        this.notifyLoading(true);
        refreshApex(this.boats);
    }

    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(event.detail.boatId);
    }

    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) {
        // explicitly pass boatId to the parameter recordId
        const payload = { recordId: boatId };
        publish(this.messageContext, BoatMC, payload);
    }

    // The handleSave method must save the changes in the Boat Editor
    // passing the updated fields from draftValues to the 
    // Apex method updateBoatList(Object data).
    // Show a toast message with the title
    // clear lightning-datatable draft values
    async handleSave(event) {
        // notify loading
        const updatedFields = event.detail.draftValues;
        // Update the records via Apex
        await updateBoatList({ data: updatedFields })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    message: MESSAGE_SHIP_IT,
                    variant: SUCCESS_VARIANT,
                }));
                // Refresh LDS cache and wires
                getRecordNotifyChange([{ boatTypeId: this.boatTypeId }]);
                // Display fresh data in the datatable
                this.refresh();
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.body.message,
                    variant: ERROR_VARIANT,
                }));
            })
            .finally(() => {
                // Clear all draft values in the datatable
                this.draftValues = [];
            });
    }

    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) {
        let eventName = 'doneloading';
        if (isLoading) {
            eventName = 'loading';
        }
        this.dispatchEvent(new CustomEvent(eventName));
    }
}
