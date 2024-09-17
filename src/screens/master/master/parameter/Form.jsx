import { View, Text } from 'react-native'
import React, { useState } from 'react'
import RNPickerSelect from 'react-native-picker-select';
import Select2 from '@/src/screens/components/Select2';
import axios from '@/src/libs/axios';
import { useQuery } from '@tanstack/react-query';


const Form = () => {
const [jenisParameter, setJenisParameter] = useState([])
const [pengawetan, setPengawetan] = useState([])

const fetchParameter = useQuery(
  ["jenis-parameter"],
  () => axios.get("/master/jenis-parameter").then(res => res.data.data),
  {
    onSuccess: (data) => setJenisParameter(data),
  }
)

const fetchPengawetan = useQuery(
  ["pengawetan"],
  () => axios.get("/master/pengawetan").then(res => res.data.data),
  {
    onSuccess: (data) => setPengawetan(data),
  }
)

const formattedJenisParameter = jenisParameter.map(item => ({label: item.nama, value: item.id}))
const formattedPengawetan = pengawetan.map(item => ({label: item.nama, value: item.id}))

  return (
    <View className="mx-5">
      <Select2 items={formattedJenisParameter} onChangeValue={() => {}} placeholder={{ label: "Pilih jenis parameter", value: null }} />
      <Select2 items={formattedPengawetan} onChangeValue={() => {}} placeholder={{ label: "Pilih jenis pengawet", value: null }} />
    </View>
  )
}

export default Form