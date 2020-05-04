export interface ContactsChooserInterface {
    open(): Promise<ContactsChooserResult>;
    requestPermission(): Promise<Boolean>;
}

export class ContactsChooserResult {

    public name: String;
    public phone: String;

    constructor(name: String, phone: String) {
        this.name = name;
        this.phone = phone;
    }
}

export class Common {
}