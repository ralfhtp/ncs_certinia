import { LightningElement, track} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {
    subscribe,
    unsubscribe,
    onError,
    setDebugFlag,
    isEmpEnabled,
} from 'lightning/empApi';

import callAutolaunchedFlow from '@salesforce/apex/ResourceRequest_SubmitInfoToECAS.callAutolaunchedFlow'; 


export default class EmpApiLWC extends LightningElement {
    //@track opptyId = '00685000007ubqUAAQ';
    @track opptyId = '';
    @track reqtId;
    result = '';
    channelName = '/event/Submit_Resource_Request__e';
    isSubscribed = false;
    subscription;

    isSubscribeDisabled = false;
    isUnsubscribeDisabled = !this.isSubscribeDisabled;

    subscription = {};

    connectedCallback() {
        if (!isEmpEnabled) {
            console.log('Dont support EMP');
            return;
        }

        setDebugFlag(true);
        onError((error) => {
            console.log('Received error from server: ', JSON.stringify(error));
        });
    }

    get subscriptionButtonLabel() {
        return this.isSubscribed ?  "Unsubscribe" : "Subscribe";
    }

    changeId(event) {
        this.reqtId = event.target.value;
        console.log(event.target.value);
        console.log(this.reqtId);
    }

    handleChannelNameChange({ target }){
        this.channelName = target.value;
    }

    handleSubscription () {
        if (!this.channelName) return;
        
        if (!this.isSubscribed) {
            this.handleSubscribe();
        } else {
            this.handleUnsubscribe();
        }
    }

    handleSubscribe() {
        const messageCallback = (response) => {
            this.result = JSON.stringify(response, null, 2);
        };

        subscribe(this.channelName, -1, messageCallback)
            .then((response) => {
            this.subscription = response;
            this.isSubscribed = true;
        });
    }

    handleUnsubscribe() {
        unsubscribe(this.subscription, (response) => {
            this.isSubscribed = false;
            this.result = '';
        });
    }   


    runApexCode() {
        callAutolaunchedFlow({ recordId : this.reqtId})
            .then(result => {
                if (result == 'success') {
                    this.showToast('Success', 'Submitted Resource Request to ECAS successfully!', 'success', 'dismissable');
                } else {
                    this.showToast('Error', result, 'error', 'dismissable');
                }
            })
            .catch(error => {
                this.showToast('Error', JSON.stringify(error), 'error', 'dismissable');
            }); 
    }

    showToast(title, message, variant, mode) {
        const toastEvent = new ShowToastEvent({ title, message, variant, mode});
        this.dispatchEvent(toastEvent);
    }
}