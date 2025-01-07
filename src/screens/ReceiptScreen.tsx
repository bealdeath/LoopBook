import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ReceiptScreen() {
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const handleUploadReceipt = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission to access the media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Image],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
      console.log('Receipt uploaded:', result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receipt Manager</Text>
      {receiptImage && <Image source={{ uri: receiptImage }} style={styles.image} />}
      <TouchableOpacity style={styles.button} onPress={handleUploadReceipt}>
        <Text style={styles.buttonText}>Upload Receipt</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginTop: 20,
  },
});
