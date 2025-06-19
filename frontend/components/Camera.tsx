import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const Camera = forwardRef((props: any, ref) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  useImperativeHandle(ref, () => ({
    takePictureAsync: async (options?: any) => {
      if (cameraRef.current) {
        return await cameraRef.current.takePictureAsync(options);
      }
      return null;
    }
  }));

  if (permission === null) {
    return (
      <View style={styles.container}>
        <Text>Chargement de la caméra...</Text>
      </View>
    );
  }

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text>Pas d'accès à la caméra</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, props.style]}>
      <CameraView
        style={styles.camera}
        facing={props.type || 'back'}
        flash={props.flash || 'off'}
        ref={cameraRef}
        onCameraReady={props.onCameraReady}
        onBarcodeScanned={props.onBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: props.barcodeScannerSettings?.barCodeTypes || ['qr']
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'black', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  camera: { 
    flex: 1, 
    width: '100%' 
  }
});

export default Camera;