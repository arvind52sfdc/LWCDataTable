@IsTest
private with sharing class AccountContactControllerTest {
    
    @testSetup
    static void setupTestData() {
        // Create test accounts
        List<Account> testAccounts = new List<Account>();
        
        for (Integer i = 0; i < 3; i++) {
            testAccounts.add(new Account(
                Name = 'Test Account ' + i,
                Phone = '(555) 123-456' + i,
                Industry = 'Technology'
            ));
        }
        
        insert testAccounts;
        
        // Create test contacts
        List<Contact> testContacts = new List<Contact>();
        
        for (Account acc : testAccounts) {
            testContacts.add(new Contact(
                AccountId = acc.Id,
                FirstName = 'John',
                LastName = 'Doe',
                Title = 'CEO',
                Email = 'john.doe@test.com',
                Phone = '(555) 987-6543'
            ));
            
            testContacts.add(new Contact(
                AccountId = acc.Id,
                FirstName = 'Jane',
                LastName = 'Smith',
                Title = 'CTO',
                Email = 'jane.smith@test.com',
                Phone = '(555) 987-6544'
            ));
        }
        
        insert testContacts;
    }
    
    @IsTest
    static void testGetAccountsWithContacts_NoFilters() {
        Test.startTest();
        List<AccountContactController.AccountWithContacts> results = 
            AccountContactController.getAccountsWithContacts(null, 10);
        Test.stopTest();
        
        System.assertNotEquals(0, results.size(), 'Should return accounts');
        
        for (AccountContactController.AccountWithContacts acc : results) {
            System.assertNotEquals(null, acc.id, 'Account ID should not be null');
            System.assertNotEquals(null, acc.name, 'Account Name should not be null');
            System.debug('Account: ' + acc.name + ', Contacts: ' + acc.contacts.size());
        }
    }
    
    @IsTest
    static void testGetAccountsWithContacts_WithAccountIds() {
        List<Account> accounts = [SELECT Id FROM Account LIMIT 1];
        List<Id> accountIds = new List<Id>{accounts[0].Id};
        
        Test.startTest();
        List<AccountContactController.AccountWithContacts> results = 
            AccountContactController.getAccountsWithContacts(accountIds, 10);
        Test.stopTest();
        
        System.assertEquals(1, results.size(), 'Should return only one account');
        System.assertEquals(accounts[0].Id, results[0].id, 'Should return the correct account');
    }
    
    @IsTest
    static void testGetAccountsWithContacts_WithContacts() {
        Test.startTest();
        List<AccountContactController.AccountWithContacts> results = 
            AccountContactController.getAccountsWithContacts(null, 10);
        Test.stopTest();
        
        System.assertNotEquals(0, results.size(), 'Should return accounts');
        
        Boolean hasContacts = false;
        for (AccountContactController.AccountWithContacts acc : results) {
            if (acc.contacts != null && !acc.contacts.isEmpty()) {
                hasContacts = true;
                for (AccountContactController.ContactWrapper contact : acc.contacts) {
                    System.assertNotEquals(null, contact.id, 'Contact ID should not be null');
                    System.assertNotEquals(null, contact.name, 'Contact Name should not be null');
                }
            }
        }
        
        System.assert(hasContacts, 'At least one account should have contacts');
    }
    
    @IsTest
    static void testGetAccountsWithContacts_Limit() {
        Test.startTest();
        List<AccountContactController.AccountWithContacts> results = 
            AccountContactController.getAccountsWithContacts(null, 2);
        Test.stopTest();
        
        System.assert(results.size() <= 2, 'Should respect the limit parameter');
    }
}
