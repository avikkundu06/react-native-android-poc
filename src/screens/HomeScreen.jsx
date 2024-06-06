import {Alert, Button, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

GoogleSignin.configure({
  webClientId: '343258007230-ophgpe1ejp5afjaa1jm4m9m4jm8cbh1p.apps.googleusercontent.com',
});

const HomeScreen = ({navigation}) => {
  const [user, setUser] = useState(null);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const {idToken} = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);

      const user = userCredential.user;
      console.log(user);

      //access token
      const idTokenResult = await user.getIdTokenResult();
      console.log(idTokenResult.token);

      //JWT token
      const jwtToken = await user.getIdToken();
      console.log(jwtToken);
    } catch (error) {
      console.error(error);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await auth().signOut();
      setUser(null);
      Alert.alert('Success', 'Signed out successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    // Check if there is a user signed in on component mount
    const unsubscribe = auth().onAuthStateChanged(user => {
      console.log('user', user);
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);
  return (
    <View>
      <Text>HomeScreen</Text>
      <View style={styles.buttonContainer}>
        {!user ? (
          <Button onPress={signInWithGoogle} title="Google Sign In" />
        ) : (
          <Button
            onPress={() => {
              navigation.navigate('Details', {message: 'navigated to details'});
            }}
            title="Press me"
          />
        )}
        {user && <Button onPress={signOut} title="Sign Out" />}
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  buttonContainer: {
    margin: 20,
  },
});
