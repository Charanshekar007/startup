import "../global.css";
import { Text, View } from "react-native";

export default function Page() {
  return (
    <View className="flex-1 items-center p-6">
      <View className="flex-1 justify-center max-w-[960px] mx-auto">
        <Text className="text-[64px] font-bold">Hello World</Text>
        <Text className="text-[36px] text-[#38434D]">This is the first page of your app.</Text>
      </View>
    </View>
  );
}
