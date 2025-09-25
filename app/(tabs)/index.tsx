import { Image } from 'expo-image';
import { Text,StyleSheet, View } from 'react-native';


export default function HomeScreen() {
  return (
    <View className='flex justify-center items-center h-36'>
      <Text className=' text-red-200'>
        Hi
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
