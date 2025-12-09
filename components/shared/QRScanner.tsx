import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);

    // Validate that this is an event check-in QR code
    try {
      const qrData = JSON.parse(data);
      if (qrData.eventId) {
        onScan(qrData.eventId);
      } else {
        Alert.alert('Invalid QR Code', 'This QR code is not for event check-in.');
        setScanned(false);
      }
    } catch (error) {
      Alert.alert('Invalid QR Code', 'Unable to read QR code data.');
      setScanned(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={Colors.light.text} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            Please allow camera access to scan QR codes for event check-in.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={styles.overlayTop}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={32} color={Colors.light.background} />
            </TouchableOpacity>
          </View>

          {/* Scanner frame */}
          <View style={styles.scannerContainer}>
            <View style={styles.scannerFrame}>
              {/* Corner markers */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
          </View>

          {/* Bottom overlay */}
          <View style={styles.overlayBottom}>
            <Text style={styles.instructionText}>
              Align QR code within the frame
            </Text>
            {scanned && (
              <TouchableOpacity
                style={styles.rescanButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.rescanButtonText}>Tap to Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: Spacing.xl,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.fhsuGold,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  instructionText: {
    fontSize: FontSizes.md,
    color: Colors.light.background,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  rescanButton: {
    backgroundColor: Colors.fhsuGold,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  rescanButtonText: {
    color: Colors.light.background,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  message: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
    textAlign: 'center',
    padding: Spacing.xl,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.x2l,
  },
  permissionTitle: {
    fontSize: FontSizes.x2l,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.x2l,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: Colors.fhsuGold,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.x2l,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  permissionButtonText: {
    color: Colors.light.background,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.x2l,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
});
