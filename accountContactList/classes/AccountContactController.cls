public with sharing class AccountContactController {
    @AuraEnabled(cacheable=true)
    public static List<AccountWithContacts> getAccountsWithContacts(
        List<Id> accountIds, 
        Integer limitCount
    ) {
        String soqlQuery = 'SELECT Id, Name, Phone, Industry, ' +
            '(SELECT Id, Name, Title, Email, Phone FROM Contacts ORDER BY Name LIMIT 10) ' +
            'FROM Account';
        
        if (accountIds != null && !accountIds.isEmpty()) {
            soqlQuery += ' WHERE Id IN :accountIds';
        }
        
        soqlQuery += ' ORDER BY Name LIMIT :limitCount';
        
        List<Account> accounts = Database.query(soqlQuery);
        List<AccountWithContacts> results = new List<AccountWithContacts>();
        
        for (Account acc : accounts) {
            results.add(new AccountWithContacts(acc));
        }
        
        return results;
    }
    
    public class AccountWithContacts {
        @AuraEnabled
        public Id id { get; private set; }
        
        @AuraEnabled
        public String name { get; private set; }
        
        @AuraEnabled
        public String phone { get; private set; }
        
        @AuraEnabled
        public String industry { get; private set; }
        
        @AuraEnabled
        public List<ContactWrapper> contacts { get; private set; }
        
        public AccountWithContacts(Account acc) {
            this.id = acc.Id;
            this.name = acc.Name;
            this.phone = acc.Phone;
            this.industry = acc.Industry;
            this.contacts = new List<ContactWrapper>();
            
            if (acc.Contacts != null) {
                for (Contact con : acc.Contacts) {
                    this.contacts.add(new ContactWrapper(con));
                }
            }
        }
    }
    
    public class ContactWrapper {
        @AuraEnabled
        public Id id { get; private set; }
        
        @AuraEnabled
        public String name { get; private set; }
        
        @AuraEnabled
        public String title { get; private set; }
        
        @AuraEnabled
        public String email { get; private set; }
        
        @AuraEnabled
        public String phone { get; private set; }
        
        public ContactWrapper(Contact con) {
            this.id = con.Id;
            this.name = con.Name;
            this.title = con.Title;
            this.email = con.Email;
            this.phone = con.Phone;
        }
    }
}
