import { InjectionToken } from '@angular/core';

import { ContactResponse, ContactStatusField, Field, FieldGroup, Group, GroupContact, StatusField } from '../../interfaces';

export interface IMockData {
  contacts: ContactResponse[];
  fields: Field[];
  fieldGroups: FieldGroup[];
  statuses: StatusField[];
  contactStatuses: ContactStatusField[];
  groups: Group[];
  groupContacts: GroupContact[];
}

export const mockData: IMockData = {
  contacts: [
    {
      businessId: 'ac87075d-93a3-4a0d-a61c-5665dc3dbe86',
      contactFields: {
        nodes: [
          {
            field: { _id: '31d87f2f-92ff-4fc5-9aa8-2a3b0bd01d94', name: 'imageUrl', businessId: null, type: 'input' },
            fieldId: '31d87f2f-92ff-4fc5-9aa8-2a3b0bd01d94',
            value: 'https://payevertesting.blob.core.windows.net/images/a87ec496-cb3f-401c-bde8-38aac9cce51c-photo_2020-07-06_23-01-35.jpg',
          } as any,
          {
            field: { _id: 'd9aab937-ad45-4815-9a4b-63f39ec12b53', name: 'firstName', businessId: null, type: 'input' },
            fieldId: 'd9aab937-ad45-4815-9a4b-63f39ec12b53',
            value: 'Fname',
          },
          {
            field: { _id: 'aea7b2c2-3551-4c13-9ec3-a3b663bd8696', name: 'lastName', businessId: null, type: 'input' },
            fieldId: 'aea7b2c2-3551-4c13-9ec3-a3b663bd8696',
            value: 'Lname',
          },
        ],
      },
      _id: '0b504dd6-21ef-48ad-b6e6-00ae4b75c75d',
      type: 'Work',
    },
    {
      businessId: 'ac87075d-93a3-4a0d-a61c-5665dc3dbe86',
      contactFields: {
        nodes: [
          {
            field: { _id: 'd9aab937-ad45-4815-9a4b-63f39ec12b53', name: 'firstName', businessId: null, type: 'input' },
            fieldId: 'd9aab937-ad45-4815-9a4b-63f39ec12b53',
            value: 'first',
          },
          {
            field: { _id: 'aea7b2c2-3551-4c13-9ec3-a3b663bd8696', name: 'lastName', businessId: null, type: 'input' },
            fieldId: 'aea7b2c2-3551-4c13-9ec3-a3b663bd8696',
            value: 'last',
          },
        ],
      },
      _id: '12ff0e3d-d1eb-4a48-a088-c2e013c33b5f',
      type: 'Work',
    },
  ],
  fields: [
    {
      id: 'd9aab937-ad45-4815-9a4b-63f39ec12b53',
      name: 'firstName',
      businessId: null,
      type: 'input',
    },
    {
      id: 'aea7b2c2-3551-4c13-9ec3-a3b663bd8696',
      name: 'lastName',
      businessId: null,
      type: 'input',
    },
    {
      id: '4f0883c5-782c-4aee-bc78-aa816b0a147c',
      name: 'email',
      businessId: null,
      type: 'input',
    },
    {
      id: '31d87f2f-92ff-4fc5-9aa8-2a3b0bd01d94',
      name: 'imageUrl',
      businessId: null,
      type: 'input',
    },
    {
      id: 'f74d86a1-baba-49ab-9e6d-b54b443eec5a',
      name: 'mobilePhone',
      businessId: null,
      type: 'input',
    },
    {
      id: '01ddf78e-b5f8-4cee-89ac-eea8b3b5415b',
      name: 'homepage',
      businessId: null,
      type: 'input',
    },
    {
      id: '43b2e39b-b4a8-4a4a-8e17-6908aa9e7ce8',
      name: 'street',
      businessId: null,
      type: 'input',
    },
    {
      id: 'abb9689c-2d5d-4cba-bbd5-4a50fd93057d',
      name: 'city',
      businessId: null,
      type: 'input',
    },
    {
      id: '61b97dea-04a8-4b57-ba05-14cef537ec5a',
      name: 'state',
      businessId: null,
      type: 'input',
    },
    {
      id: '5c4ac4a3-683a-49aa-bf8c-6795cfee8a5a',
      name: 'zip',
      businessId: null,
      type: 'input',
    },
    {
      id: '57f155d8-c343-48b2-b4a4-0011177b5d06',
      name: 'country',
      businessId: null,
      type: 'input',
    },
    {
      name: '123',
      type: 'input',
      showOn: [],
      filterable: null,
      groupId: '66dd6deb-52e4-4978-980c-ee27f75d4940',
      id: 'fe366e83-66a0-4806-9537-798d9bc7bf32',
      businessId: 'ac87075d-93a3-4a0d-a61c-5665dc3dbe86'
    },
    {
      name: 'My field',
      type: 'input',
      showOn: [
        'person'
      ],
      filterable: true,
      groupId: '335fb5c1-d290-4317-a399-60185324a0a1',
      id: '543c70d7-1e78-49bc-bad3-bef9381bc562',
      businessId: 'ac87075d-93a3-4a0d-a61c-5665dc3dbe86'
    }
  ],
  fieldGroups: [
    {
      id: '335fb5c1-d290-4317-a399-60185324a0a1',
      name: 'FG 1',
      businessId: 'ac87075d-93a3-4a0d-a61c-5665dc3dbe86'
    },
    {
      id: '66dd6deb-52e4-4978-980c-ee27f75d4940',
      name: 'FG 2',
      businessId: 'ac87075d-93a3-4a0d-a61c-5665dc3dbe86'
    },

  ],
  statuses: [],
  contactStatuses: [],
  groups: [
    {
      id: '48b57ed0-e273-478e-9a25-7006e1297b60',
      isDefault: false,
      name: 'New Group',
    },
    {
      id: 'a10148d9-b497-4b50-afe5-0851e4a99019',
      isDefault: false,
      name: 'New group 2',
    },
  ],
  groupContacts: [],
};

export const MOCK_DATA = new InjectionToken<IMockData>('MOCK_DATA');
