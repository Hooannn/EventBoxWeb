import type { SavedImageData } from "../../components/ImagePickerEditor";

export type InternalSavedImageData = Omit<SavedImageData, "imageCanvas">;

export interface CreateTicketTypeInputs {
  temp_id: string;
  name: string;
  price: string;
  init_stock: string;
  description?: string;
}
