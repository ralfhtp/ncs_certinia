import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import callAutolaunchedFlow from '@salesforce/apex/ResourceRequest_SubmitInfoToECAS.callAutolaunchedFlow'; 

export default class SubmitResourceRequestToECAS extends LightningElement {
    @api recordId;

    @api invoke(){
        this.runApexCode();
    }

    runApexCode() {
        callAutolaunchedFlow({ recordId : this.recordId})
            .then(result => {
                if (result == 'success') {
                    this.showToast('Success', 'Submitted Resource Request to ECAS successfully!', 'success');
                } else {
                    this.showToast('Error', result, 'error');
                }
            })
            .catch(error => {
                this.showToast('Error', JSON.stringify(error), 'error');
            }); 
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant, mode });
        this.dispatchEvent(toastEvent);
    }
}
