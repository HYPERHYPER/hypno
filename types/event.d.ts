export type EventMicrosite = {
    logo?: string;
    background?: string;
    color?: string;
    data_capture?: boolean;
    fields?: string[];
    data_capture_title?: string;
    data_capture_subtitle?: string;
    enable_legal?: boolean;
    explicit_opt_in?: boolean;
    terms_privacy?: string;
} | any;

export type EventConfig = {
    id?: number;
    name?: string;
    client_id?: number;
    terms_and_conditions?: string;
    is_private?: boolean;
    metadata?: EventMicrosite | null;
}

