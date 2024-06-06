import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const DetailsScreen = ({route, navigation}) => {
  const {message} = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

export default DetailsScreen;

const styles = StyleSheet.create({
  container: {
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#000',
    fontSize: 20,
  },
});
