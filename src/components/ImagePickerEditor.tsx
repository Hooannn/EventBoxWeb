import { Modal, ModalContent, ModalBody } from "@heroui/react";
import FilerobotImageEditor, {
  TABS,
  TOOLS,
} from "react-filerobot-image-editor";
interface ImagePickerEditorProps {
  source: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SavedImageData, designState: unknown) => void;
}

export type SavedImageData = {
  name: string;
  extension: string;
  mimeType: string;
  fullName?: string;
  height?: number;
  width?: number;
  imageBase64?: string;
  imageCanvas?: HTMLCanvasElement; // doesn't support quality
  quality?: number;
  cloudimageUrl?: string;
};

export default function ImagePickerEditor(props: ImagePickerEditorProps) {
  return (
    <>
      <Modal
        size="full"
        hideCloseButton
        isDismissable={false}
        isOpen={props.isOpen}
        onClose={props.onClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="p-0">
                {props.source && (
                  <FilerobotImageEditor
                    source={props.source}
                    onSave={props.onSave}
                    theme={{
                      palette: {
                        "btn-primary-text": "#FFFFFF",
                        "btn-secondary-text": "#FFFFFF",
                        primary: "#050505",
                        secondary: "#141D26",
                        error: "#801313",
                        warning: "#8D4D00",
                        success: "#1B3E1E",
                      },
                    }}
                    onClose={onClose}
                    annotationsCommon={{
                      fill: "#ff0000",
                    }}
                    Rotate={{ angle: 90, componentType: "slider" }}
                    Crop={{
                      presetsItems: [],
                      presetsFolders: [],
                    }}
                    tabsIds={[TABS.ADJUST, TABS.ANNOTATE, TABS.RESIZE]}
                    defaultTabId={TABS.ADJUST}
                    defaultToolId={TOOLS.CROP}
                    savingPixelRatio={0}
                    previewPixelRatio={0}
                  />
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
