import { useState, useCallback } from 'react';
import ContactosHeader from '../abm-contactos/components/ContactosHeader';
import ContactosTable from '../abm-contactos/components/ContactosTable';
import { ContactsProvider } from '../abm-contactos/components/AddContactModal';
import { contactsAPI } from '../services/api';

function ABMContactos() {
  const [contactsTableKey, setContactsTableKey] = useState(0);

  const addContactToTable = useCallback(async (newContact) => {
    setContactsTableKey(prev => prev + 1);
  }, []);

  return (
    <ContactsProvider addContact={addContactToTable}>
      <div className="flex flex-col h-screen overflow-hidden">
        <ContactosHeader />
        <div className="flex-1 overflow-auto">
          <ContactosTable key={contactsTableKey} onAddContact={addContactToTable} />
        </div>
      </div>
    </ContactsProvider>
  );
}

export default ABMContactos;
