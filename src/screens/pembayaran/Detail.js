import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';

export default function Detail() {
  const [virtualAccount, setVirtualAccount] = useState('1234567890');
  const [nominalPembayaran, setNominalPembayaran] = useState('500000');
  const navigation = useNavigation();

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    alert('Copied to clipboard!');
  };

  return (
    <View style={styles.parentWrapper}>
      <Text style={styles.parentTitle}>Detail Pembayaran</Text>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Virtual Account</Text>
          <TouchableOpacity onPress={() => copyToClipboard(virtualAccount)}>
            <Text style={styles.copyButton}>Salin</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cardContent}>{virtualAccount}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Nominal Pembayaran</Text>
          <TouchableOpacity onPress={() => copyToClipboard(nominalPembayaran)}>
            <Text style={styles.copyButton}>Salin</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cardContent}>{nominalPembayaran}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Batalkan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Cek Status</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  parentWrapper: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  parentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  copyButton: {
    fontSize: 14,
    color: '#4682B4',
    fontWeight: 'bold',
  },
  cardContent: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    backgroundColor: '#4682B4',
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
