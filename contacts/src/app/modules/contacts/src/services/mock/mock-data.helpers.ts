import { ContactField, ContactResponse, ContactTypesEnum } from '../../interfaces';

const CONTACTS_KEY = 'mocked_contacts_5';
const types = [ContactTypesEnum.Company, ContactTypesEnum.Person, ContactTypesEnum.Partner];
const firsNames = ['Alice', 'Bob', 'Cia', 'Dave'];
const lastNames = ['Smith', 'McKenzie', 'Washington', 'Lincoln'];
const imageSizes = [240, 400, 300];
const imageTypes = ['arch', 'people', 'tech'];

function pickElement(items: any[]): any {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomImg(): string {
  return `https://placeimg.com/${pickElement(imageSizes)}/${pickElement(imageSizes)}/${pickElement(imageTypes)}`;
}

function randomImageField(): ContactField {
  return {
    id: 'id-random-1',
    field: {id: '31d87f2f-92ff-4fc5-9aa8-2a3b0bd01d94', name: 'imageUrl', businessId: null, type: 'input'},
    fieldId: '31d87f2f-92ff-4fc5-9aa8-2a3b0bd01d94',
    value: getRandomImg()
  };
}

function randomFirstName(): ContactField {
  return {
    id: 'id-random-2',
    field: {id: 'd9aab937-ad45-4815-9a4b-63f39ec12b53', name: 'firstName', businessId: null, type: 'input'},
    fieldId: 'd9aab937-ad45-4815-9a4b-63f39ec12b53',
    value: pickElement(firsNames)
  };
}

function randomLastName(): ContactField {
  return {
    id: 'id-random-3',
    field: {id: 'aea7b2c2-3551-4c13-9ec3-a3b663bd8696', name: 'lastName', businessId: null, type: 'input'},
    fieldId: 'aea7b2c2-3551-4c13-9ec3-a3b663bd8696',
    value: pickElement(lastNames)
  };
}

function randomType(): ContactField {
  return {
    id: 'id-random-4',
    field: {id: 'random-', name: 'type', businessId: null, type: 'input'},
    fieldId: 'aea7b2c2-3551-4c13-9ec3-a3b663bd8698',
    value: pickElement(lastNames)
  };
}

function randomContact(i: number): ContactResponse {
  const nodes = [randomFirstName(), randomLastName()];
  if (pickElement([true, false])) {
    nodes.push(randomImageField());
  }

  return {
    id: `contact-id-${i}`,
    businessId: `business-id-${i}`,
    contactFields: {
      nodes
    },
    type: pickElement(types)
  };
}

export function generateContacts(num: number = 10): ContactResponse[] {
  const res = [];

  for (let i = 0; i < num; i++) {
    res.push(randomContact(i));
  }

  storeContacts(res);
  return res;
}

export function getMockContacts(num: number = 10): ContactResponse[] {
  if (sessionStorage.getItem(CONTACTS_KEY)) {
    return JSON.parse(sessionStorage.getItem(CONTACTS_KEY));
  }

  return generateContacts(num);
}

export function storeContacts(contacts: ContactResponse[]): void {
  sessionStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

export function deleteContactFromStore(id: string): void {
  const contacts = getMockContacts().filter(el => el.id !== id);
  storeContacts(contacts);
}
