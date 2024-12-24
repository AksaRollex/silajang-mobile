import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const ContractDetailScreen = ({ route, navigation }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const { selected } = route.params;

  const months = [
    { id: 1, name: 'Januari' },
    { id: 2, name: 'Februari' },
    { id: 3, name: 'Maret' },
    { id: 4, name: 'April' },
    { id: 5, name: 'Mei' },
    { id: 6, name: 'Juni' },
    { id: 7, name: 'Juli' },
    { id: 8, name: 'Agustus' },
    { id: 9, name: 'September' },
    { id: 10, name: 'Oktober' },
    { id: 11, name: 'November' },
    { id: 12, name: 'Desember' },
  ];

  const getFormattedMonths = () => {
    if (!formData.kontrak?.bulan) return '';
    return formData.kontrak.bulan
      .map((monthId) => months.find((m) => m.id === parseInt(monthId))?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getEdit = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/administrasi/kontrak/${selected}`);
      setFormData(response.data.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (value) => {
    setLoading(true);
    try {
      await axios.post(`/administrasi/kontrak/${selected}/update`, {
        ...formData,
        kesimpulan_kontrak: value,
      });
      setFormData((prev) => ({ ...prev, kesimpulan_kontrak: value }));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = () => {
    if (formData.kontrak?.dokumen_permohonan) {
      Linking.openURL(`/storage/${formData.kontrak.dokumen_permohonan}`);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Dokumen Permohonan tidak ditemukan',
      });
    }
  };

  useEffect(() => {
    if (selected) {
      getEdit();
    }
  }, [selected]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const InfoItem = ({ icon, label, value }) => (
    <View style={styles.infoItem}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={24} color="#28a745" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#dc3545" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Kontrak Permohonan</Text>
      </View>

      {/* Applicant Information */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informasi Pemohon</Text>
        <InfoItem
          icon="user"
          label="Customer"
          value={formData.user?.nama}
        />
        <InfoItem
          icon="building"
          label="Instansi"
          value={formData.user?.detail?.instansi}
        />
        <InfoItem
          icon="map-marker"
          label="Alamat"
          value={formData.user?.detail?.alamat}
        />
        <InfoItem
          icon="phone"
          label="No. Telepon/WhatsApp"
          value={formData.user?.phone}
        />
      </View>

      {/* Request Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detail Permohonan</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <InfoItem
              icon="industry"
              label="Industri"
              value={formData.industri}
            />
            <InfoItem
              icon="map-marker"
              label="Alamat"
              value={formData.alamat}
            />
            <InfoItem
              icon="file"
              label="Jenis Kegiatan Industri"
              value={formData.kegiatan}
            />
          </View>
          <View style={styles.column}>
            <InfoItem
              icon="credit-card"
              label="Jenis Pembayaran"
              value={formData.pembayaran}
            />
            <InfoItem
              icon="calendar"
              label="Tanggal Permohonan"
              value={formData.tanggal}
            />
          </View>
        </View>
      </View>

      {/* Contract Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detail Kontrak</Text>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={downloadFile}
        >
          <Icon name="download" size={24} color="#000" />
          <Text style={styles.downloadText}>Download Dokumen Permohonan</Text>
        </TouchableOpacity>

        <InfoItem
          icon="clock-o"
          label="Masa Kontrak"
          value={getFormattedMonths()}
        />
        <InfoItem
          icon="file-text"
          label="Perihal"
          value={formData.kontrak?.perihal}
        />
        <InfoItem
          icon="envelope"
          label="Nomor Surat"
          value={formData.kontrak?.nomor_surat}
        />
        <InfoItem
          icon="calendar"
          label="Tanggal Permohonan"
          value={formData.kontrak?.tanggal}
        />

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Kesimpulan Kontrak</Text>
          <View style={styles.statusOptions}>
            {['Menunggu', 'Diterima', 'Ditolak'].map((status, index) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  formData.kesimpulan_kontrak === index && styles.statusButtonActive,
                ]}
                onPress={() => handleStatusChange(index)}
              >
                <Text style={[
                  styles.statusButtonText,
                  formData.kesimpulan_kontrak === index && styles.statusButtonTextActive,
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#666',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#e8f5e9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  downloadText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  statusContainer: {
    marginTop: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#007bff',
  },
  statusButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
});

export default ContractDetailScreen;