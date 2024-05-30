import { useState, useCallback } from "react";
import DocumentPicker, {DocumentPickerOptions} from "react-native-document-picker";
import { SupportedPlatforms } from "react-native-document-picker/lib/typescript/fileTypes";

const useDocumentPicker = (options: DocumentPickerOptions<SupportedPlatforms> = {}) => {
  const [files, setFiles] = useState([] as any);
  const pick = useCallback(async () => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: "fullScreen",
        ...options,
      });
      setFiles(response);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const reset = useCallback(() => setFiles([]), []);

  return { files, pick, reset };
};

export default useDocumentPicker;
