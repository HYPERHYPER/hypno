export type AiConfig = {
    enabled?: boolean;
    type?: 'midjourney' | 'stable diffusion';
    text_prompt?: string;
    prompt_strength?: number;
    img_prompt?: string[];
    midjourney_parameters?: string;
}

export type EventMicrosite = {
    logo_image?: string;
    home_background_image?: string;
    background_color?: string;
    primary_color?: string;
    data_capture?: boolean;
    fields?: any;
    data_capture_title?: string;
    data_capture_subtitle?: string;
    enable_legal?: boolean;
    explicit_opt_in?: boolean;
    terms_privacy?: string;
    email_delivery?: boolean;
    ai_generation?: AiConfig | null;
} | any;
type EventMicrositeKey = keyof EventMicrosite;

export type EventConfig = {
    id?: number;
    name?: string;
    party_slug?: string;
    client_id?: number;
    terms_and_conditions?: string;
    is_private?: number; // 1 == public, 2 == private
    delivery?: string; // "qr_gallery" to show qr code to microsite, "qr" to disable
    event_type?: string;
    custom_gallery_assigned?: string; // 1 == custom frontend enabled, 0 == default 
    metadata?: {
        ai_generation?: AiConfig | null;
        qr_asset_download?: string;
        filetype_download?: string;
    }
    custom_frontend?: EventMicrosite | null;
    filetype_download?: string;
}

export type EventPayload = {
    event?: {
        id?: number;
        name?: string;
        client_id?: number;
        custom_gallery_assigned?: string;
    };
    custom_frontend?: EventMicrosite;
    filter?: { id: number };
    watermarks?: Array<{title: string, url: string}>
    delivery?: string; // "qr_gallery" to show qr code to microsite, "qr" to disable
}

