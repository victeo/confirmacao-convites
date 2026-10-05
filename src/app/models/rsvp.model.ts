export enum RSVPStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED'
}

export enum GuestType {
  TITULAR = 'TITULAR',
  DEPENDENT = 'DEPENDENT',
  EXTRA = 'EXTRA'
}

export interface EventConfig {
  id?: string;
  locationName: string;
  address: string;
  googleMapsLink: string;
  additionalInfo?: string;
}

export interface Guest {
  id?: string;
  name: string;
  type: GuestType;
  status: RSVPStatus;
  phone?: string;
}

export interface RSVPGroup {
  id?: string;
  titularId?: string;
  titularName: string;
  phone?: string; // Adicionado telefone
  maxExtras: number;
  preRegisteredGuests: Guest[];
  extraGuests: Guest[];
}

export interface RSVPConfirmationPayload {
  groupId: string;
  confirmations: {
    guestId?: string;
    name: string;
    status: RSVPStatus;
    type: GuestType;
  }[];
}
