import { Common, ContactsChooserInterface, ContactsChooserResult } from './contacts-chooser.common';

export declare class ContactsChooser extends Common implements ContactsChooserInterface {
  requestPermission(): Promise<Boolean>;
  open(): Promise<ContactsChooserResult>;
}

export { ContactsChooserResult } from './contacts-chooser.common';