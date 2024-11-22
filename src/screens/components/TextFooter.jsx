import { Text } from "react-native-ui-lib";

export const TextFooter = () => (
  <Text className="text-center text-gray-500 text-xs mt-16 font-poppins-medium">
    {`${new Date().getFullYear()} © SI-LAJANG v.3 \n `}
    <Text className="font-poppins-bold">
      UPT LABORATORIUM LINGKUNGAN
    </Text>
    {`\n DINAS LINGKUNGAN HIDUP KAB. JOMBANG`}
  </Text>
);
