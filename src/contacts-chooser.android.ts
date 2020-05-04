import { Common, ContactsChooserInterface, ContactsChooserResult } from './contacts-chooser.common';
import * as app from 'tns-core-modules/application/application';
import { ad } from 'tns-core-modules/utils/utils';
import { action } from 'tns-core-modules/ui/dialogs/dialogs';
import { requestPermission, hasPermission } from 'nativescript-permissions';

export class ContactsChooser extends Common implements ContactsChooserInterface {

    private permission = android.Manifest.permission.READ_CONTACTS;

    requestPermission(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            requestPermission(this.permission).then(() => {
                resolve(true);
            })
            .catch(() => {
                reject(false);
            });
        });
    }

    open(): Promise<ContactsChooserResult> {
        return new Promise((resolve, reject) => {

            if (!hasPermission(this.permission)) {
                return reject('Permission not granted');
            }

            const CommonDataKinds = android.provider.ContactsContract.CommonDataKinds;
            const SELECT_PHONE_NUMBER = 19990;

            let intent = new android.content.Intent(android.content.Intent.ACTION_PICK);
            intent.setType(android.provider.ContactsContract.Contacts.CONTENT_TYPE);
            let activity = app.android.startActivity;

            try {
                activity.startActivityForResult(intent, SELECT_PHONE_NUMBER);
            } catch (err) {
                return reject();
            }

            app.android.on(app.AndroidApplication.activityResultEvent, (args: app.AndroidActivityResultEventData) => {
                app.android.off(app.AndroidApplication.activityResultEvent);

                let {requestCode, intent} = args;

                if (requestCode !== SELECT_PHONE_NUMBER) {
                    return reject();
                }

                if (!intent) {
                    return reject();
                }

                let uri = intent.getData();
                let resolver = <android.content.ContentResolver>ad.getApplicationContext().getContentResolver();

                let cursor = resolver.query(uri, null, null, null, null);
                if (cursor.moveToFirst()) {

                    // @ts-ignore
                    let contactId = cursor.getString(cursor.getColumnIndex(android.provider.ContactsContract.Contacts._ID));
                    let phones = resolver.query(
                        CommonDataKinds.Phone.CONTENT_URI, null,
                        // @ts-ignore
                        CommonDataKinds.Phone.CONTACT_ID + "=" + contactId,
                        null, null);

                    let phoneNumbers = [];

                    while (phones.moveToNext()) {
                        let phoneNumber = phones.getString(phones.getColumnIndex(CommonDataKinds.Phone.NUMBER));
                        phoneNumbers.push(phoneNumber);
                    }

                    // @ts-ignore
                    let nameIndex = cursor.getColumnIndex(CommonDataKinds.Phone.DISPLAY_NAME);
                    let name = cursor.getString(nameIndex);

                    if (phoneNumbers.length < 2) {
                        return resolve(new ContactsChooserResult(name, phoneNumbers[0]));
                    }

                    let cancelButtonText = 'Cancel';

                    action({
                        title: 'Select A Number',
                        actions: phoneNumbers,
                        cancelButtonText
                    })
                    .then(res => {
                        if (res === cancelButtonText) {
                            return reject();
                        }

                        return resolve(new ContactsChooserResult(name, res));
                    });
                }
            });
        });
    }
}