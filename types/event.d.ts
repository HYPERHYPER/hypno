export type EventMicrosite = {
    logo_image?: string;
    home_background_image?: string;
    background_color?: string;
    primary_color?: string;
    data_capture?: boolean;
    fields?: Object[];
    data_capture_title?: string;
    data_capture_subtitle?: string;
    enable_legal?: boolean;
    explicit_opt_in?: boolean;
    terms_privacy?: string;
    email_delivery?: boolean;
    ai_generation?: any;
} | any;
type EventMicrositeKey = keyof EventMicrosite;
const EventMicrositeKeys: EventMicrositeKey[] = ['logo', 'background', 'color', 'data_capture', 'fields', 'data_capture_title', 'data_capture_subtitle', 'enable_legal', 'explicit_opt_in', 'terms_privacy', 'email_delivery', 'ai_generation'];

export type EventConfig = {
    id?: number;
    name?: string;
    party_slug?: string;
    client_id?: number;
    terms_and_conditions?: string;
    is_private?: boolean;
    delivery?: string; // "qr_gallery" to show qr code to microsite, "qr" to disable
    custom_frontend?: EventMicrosite | null;
}

export type EventPayload = {
    event?: {
        id?: number;
        name?: string;
        client_id?: number;
    };
    custom_frontend?: EventMicrosite;
    filter?: { id: number };
    watermarks?: Array<{title: string, url: string}>
    delivery?: string; // "qr_gallery" to show qr code to microsite, "qr" to disable
}

