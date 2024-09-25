import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MenuView } from '@react-native-menu/menu';
import Entypo from 'react-native-vector-icons/Entypo';
import Paginate from '../../components/Paginate'; // Assume this component exists

const TrackingPengujian = ({ navigation }) => {
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [refreshKey, setRefreshKey] = useState(0);

  const tahuns = Array.from({ length: new Date().getFullYear() - 2021 }, (_, i) => ({
    id: 2022 + i,
    text: `${2022 + i}`
  }));

  const bulans = [
    { id: 1, text: "Januari" },
    { id: 2, text: "Februari" },
    { id: 3, text: "Maret" },
    { id: 4, text: "April" },
    { id: 5, text: "Mei" },
    { id: 6, text: "Juni" },
    { id: 7, text: "Juli" },
    { id: 8, text: "Agustus" },
    { id: 9, text: "September" },
    { id: 10, text: "Oktober" },
    { id: 11, text: "November" },
    { id: 12, text: "Desember" },
  ];

  const handleYearChange = useCallback((itemValue) => {
    setTahun(itemValue);
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const handleMonthChange = useCallback((itemValue) => {
    setBulan(itemValue);
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const mapStatusPengujian = (status) => {
    // Implement your status mapping logic here
    return status < 0 ? 'Revisi' : 'Dalam Proses';
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={[styles.badge, { backgroundColor: item.status < 0 ? '#fef08a' : '#e0f2fe' }]}>
          {item.text_status}
        </Text>
        <Text style={styles.lokasi}>{item.lokasi}</Text>
        <Text style={styles.kode}>{item.kode}</Text>
        <Text style={styles.date}>Tanggal Diterima: {item.tanggal_diterima}</Text>
        <Text style={styles.date}>Tanggal Selesai: {item.tanggal_selesai}</Text>
      </View>
      <View style={styles.cardActions}>
        <MenuView
          actions={[
            {
              id: 'Tracking',
              title: 'Tracking',
              systemIcon: 'list.bullet',
            },
          ]}
          onPressAction={() => {
            navigation.navigate('TrackingList', { selected : item });
          }}
        >
          <Entypo name="dots-three-vertical" size={16} color="#312e81" />
        </MenuView>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tracking Pengujian</Text>
        <View style={styles.filters}>
          <Picker
            selectedValue={tahun}
            style={styles.picker}
            onValueChange={handleYearChange}
          >
            {tahuns.map((item) => (
              <Picker.Item key={item.id} label={item.text} value={item.id} />
            ))}
          </Picker>
          <Picker
            selectedValue={bulan}
            style={styles.picker}
            onValueChange={handleMonthChange} 
          >
            {bulans.map((item) => (
              <Picker.Item key={item.id} label={item.text} value={item.id} />
            ))}
          </Picker>
        </View>
      </View>
      <Paginate
        key={refreshKey}
        url="/tracking"
        payload={{ tahun, bulan }}
        renderItem={renderItem}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    flex: 1,
    marginHorizontal: 4,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderTopWidth: 4,
    borderTopColor: '#4f46e5',
  },
  cardContent: {
    flex: 1,
  },
  cardActions: {
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  lokasi: {
    fontSize: 14,
    marginBottom: 4,
  },
  kode: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default TrackingPengujian;