import { Common, ContactsChooserInterface, ContactsChooserResult } from './contacts-chooser.common';
import { Dialogs } from '@nativescript/core';

export class ContactsChooser extends Common implements ContactsChooserInterface {

    requestPermission(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }

    open(): Promise<ContactsChooserResult> {
        return new Promise((resolve, reject) => {
            let contact_picker = CNContactPickerViewController.alloc().init();
            let appWindow = UIApplication.sharedApplication.keyWindow;

            // @ts-ignore
            let Delegator = NSObject.extend({
                contactPickerDidSelectContact(ctrl, contact: CNContact) {
                    let name = `${contact.givenName} ${contact.familyName}`;
                    let phoneNumbers = contact.phoneNumbers;

                    if (phoneNumbers.count < 2) {
                        return resolve(new ContactsChooserResult(name, phoneNumbers[0].value.stringValue.replace(/s+/g, '')));
                    }

                    let phones = [];
                    let cancelButtonText = 'Cancel';

                    for (let i = 0; i < phoneNumbers.count; i++) {
                        phones.push(phoneNumbers[i].value.stringValue.replace(/\s+/g, ''));
                    }

                    setTimeout(() => {
                        Dialogs.action({
                            title: 'Select A Number',
                            actions: phones,
                            cancelButtonText
                        })
                        .then(res => {
                            if (res === cancelButtonText) {
                                return reject(null);
                            }

                            return resolve(new ContactsChooserResult(name, res));
                        });
                    }, 570);
                },

                contactPickerDidCancel(ctrl) {
                    reject(null);
                }
            }, {
                protocols: [CNContactPickerDelegate]
            });

            contact_picker.displayedPropertyKeys = NSArray.arrayWithArray([CNContactPhoneNumbersKey]);
            contact_picker.delegate = Delegator.new();
            appWindow.rootViewController.presentViewControllerAnimatedCompletion(contact_picker, true, null);
        });
    }
}
