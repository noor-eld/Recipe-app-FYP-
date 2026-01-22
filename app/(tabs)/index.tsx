import {View, Text, StyleSheet} from 'react-native';

export default function HomeScreen() {
  return (
      <View>
        <Text style={styles.title}>Home Page</Text>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: 'white',
  },
})