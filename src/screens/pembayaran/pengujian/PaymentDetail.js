import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from '@/src/libs/axios';
import moment from 'moment';
import { Clipboard } from 'react-native';

const PaymentDetail = ({ route }) => {
  const [formData, setFormData] = useState({});
  const [countdownExp, setCountdownExp] = useState('');
  const navigation = useNavigation();
  const { uuid } = route.params;

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Text copied to clipboard');
  };

  const fetchData = useCallback(() => {
    axios.get(`/pembayaran/pengujian/${uuid}`)
      .then(res => {
        setFormData(res.data.data);
      })
      .catch(err => {
        Alert.alert('Error', err.response?.data?.message || 'An error occurred');
      });
  }, [uuid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let interval;
    if (formData.payment && !formData.payment.is_expired) {
      interval = setInterval(() => {
        const exp = moment(formData.payment.tanggal_exp);
        const now = moment();
        const diff = exp.diff(now);
        
        if (diff <= 0) {
          clearInterval(interval);
          setCountdownExp('00:00:00');
          fetchData(); // Refresh data when expired
        } else {
          const duration = moment.duration(diff);
          setCountdownExp(
            `${String(duration.hours()).padStart(2, '0')}:${String(duration.minutes()).padStart(2, '0')}:${String(duration.seconds()).padStart(2, '0')}`
          );
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [formData.payment, fetchData]);

  const handleGenerateVA = () => {
    axios.post(`/pembayaran/pengujian/${uuid}`)
      .then(() => {
        Alert.alert('Success', 'VA Payment created successfully');
        fetchData();
      })
      .catch(err => {
        Alert.alert('Error', err.response?.data?.message || 'An error occurred');
      });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{formData.kode}</Text>
      
      {!formData.payment ? (
        <View>
          <Text style={styles.infoText}>Harga: {formData.harga}</Text>
          <Text style={styles.infoText}>Atas Nama: {formData.permohonan?.user?.nama}</Text>
          <Text style={styles.alertText}>VA Pembayaran Belum Dibuat</Text>
          <TouchableOpacity style={styles.button} onPress={handleGenerateVA}>
            <Text style={styles.buttonText}>Buat VA Pembayaran</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {formData.payment.status === 'success' ? (
            <Text style={styles.successText}>Pembayaran berhasil dilakukan</Text>
          ) : formData.payment.is_expired === false ? (
            <Text style={styles.warningText}>Lakukan pembayaran sebelum: {countdownExp}</Text>
          ) : (
            <Text style={styles.errorText}>VA Pembayaran telah kedaluwarsa</Text>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Virtual Account</Text>
            <View style={styles.cardContent}>
              <Text style={styles.vaNumber}>{formData.payment?.va_number}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(formData.payment?.va_number)}>
                <Text style={styles.copyButton}>Salin</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Nominal Pembayaran</Text>
            <View style={styles.cardContent}>
              <Text style={styles.amount}>{formData.payment?.jumlah}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(formData.payment?.jumlah.toString())}>
                <Text style={styles.copyButton}>Salin</Text>
              </TouchableOpacity>
            </View>
          </View>

          {formData.payment.status !== 'success' && formData.payment.is_expired && !formData.user_has_va && (
            <TouchableOpacity style={styles.button} onPress={handleGenerateVA}>
              <Text style={styles.buttonText}>Buat VA Pembayaran</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  alertText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#1976d2',
  },
  successText: {
    backgroundColor: '#4caf50',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    marginBottom: 20,
  },
  warningText: {
    backgroundColor: '#ff9800',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vaNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  copyButton: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#1976d2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PaymentDetail;