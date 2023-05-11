import { EventMicrosite } from "@/types/event";
import _ from "lodash";

export const isCustomGallery = (metadata: EventMicrosite) => {
    const { logo, color, background, enable_legal, data_capture } = metadata;
    const customGalleryConfig = {
        logo, color, background, enable_legal, data_capture
    }
    return _.some(customGalleryConfig, _.identity);
}