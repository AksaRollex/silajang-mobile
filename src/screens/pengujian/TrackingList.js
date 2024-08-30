import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Make sure to install this package
import { useNavigation } from '@react-navigation/native';
import { Colors } from 'react-native-ui-lib';

const events = [
  { time: '18:00', description: 'Tiba di Surabaya', icon: 'plane' },
  { time: '19:00', description: 'Dikirim', icon: 'truck' },
  { time: '20:00', description: 'Proses di Gudang', icon: 'warehouse' },
  { time: '21:00', description: 'Dikirim ke Penerima', icon: 'envelope' },
  { time: '22:00', description: 'Sampai di Tujuan', icon: 'home' },
];

export default function TrackingList() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Kembali</Text>
      </TouchableOpacity>
      <ScrollView style={styles.scrollContainer}>
        {events.map((event, index) => (
          <View key={index} style={styles.eventContainer}>
            <View style={styles.iconContainer}>
              <Icon name={event.icon} size={24} color="#007bff" />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{event.time}</Text>
            </View>
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>{event.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor : "rgba(13, 71, 161, 0.2)"

  },
  backButton: {
    padding: 10,
    backgroundColor: '#6b7fde',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  eventContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  timeContainer: {
    width: 60,
    alignItems: 'center',
  },
  timeText: { 
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  descriptionContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
  },
});
