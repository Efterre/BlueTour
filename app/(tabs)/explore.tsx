import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform , Text } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabTwoScreen() {
  return (
    <SafeAreaView style = {styles.safeAreaExplore}>
      <Text> Ciro Immobile </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaExplore : {
    backgroundColor : 'white'
  }
});
