import { LightningElement, api, track } from 'lwc';
import getAccountsWithContacts from '@salesforce/apex/AccountContactController.getAccountsWithContacts';

export default class AccountContactList extends LightningElement {
    @api title = 'Accounts with Contacts';
    @api limit = 10;
    @api recordIds = []; // Optional: specific account IDs to display
    
    @track accounts = [];
    @track expandedAccounts = new Set();
    isLoading = false;
    hasError = false;
    errorMessage = '';

    connectedCallback() {
        this.fetchAccounts();
    }

    async fetchAccounts() {
        this.isLoading = true;
        this.hasError = false;
        this.errorMessage = '';
        
        try {
            const result = await getAccountsWithContacts({
                accountIds: this.recordIds && this.recordIds.length > 0 ? this.recordIds : null,
                limitCount: this.limit
            });
            
            // Transform the Apex response to match the expected format
            this.accounts = result.map(acc => ({
                Id: acc.id,
                Name: acc.name,
                Phone: acc.phone,
                Industry: acc.industry,
                Contacts: {
                    records: acc.contacts ? acc.contacts.map(contact => ({
                        Id: contact.id,
                        Name: contact.name,
                        Title: contact.title,
                        Email: contact.email,
                        Phone: contact.phone
                    })) : []
                }
            }));
            
            // Auto-expand first account if exists
            if (this.accounts.length > 0) {
                this.expandedAccounts.add(this.accounts[0].Id);
            }
        } catch (error) {
            this.hasError = true;
            this.errorMessage = error.message || 'An error occurred while fetching accounts';
            console.error('Error fetching accounts:', error);
        } finally {
            this.isLoading = false;
        }
    }

    handleAccountClick(event) {
        const accountId = event.currentTarget.dataset.accountId;
        
        if (this.expandedAccounts.has(accountId)) {
            this.expandedAccounts.delete(accountId);
        } else {
            this.expandedAccounts.add(accountId);
        }
        
        // Force reactivity
        this.accounts = [...this.accounts];
    }

    getChevronClass(accountId) {
        const isExpanded = this.expandedAccounts.has(accountId);
        return isExpanded ? 'chevron-expanded' : 'chevron-collapsed';
    }

    getContactsDisplayStyle(accountId) {
        const isExpanded = this.expandedAccounts.has(accountId);
        return {
            display: isExpanded ? 'block' : 'none'
        };
    }

    @api
    refresh() {
        this.fetchAccounts();
    }
}
