import React, { useEffect, useState } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { View, ImageBackground, Image, Text, StyleSheet } from 'react-native';
import PickerSelect from 'react-native-picker-select';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

interface IBGEUfResponse {
  sigla: string
}

interface IBGECityResponse {
  id: number,
  nome: string
}

interface PickerItem {
  label: string,
  value: string
}

const Home = () => {
    const [ ufs, setUfs ] = useState<PickerItem[]>([]);
    const [ cities, setCities ] = useState<PickerItem[]>([]);
    const [ selectedUf, setSelectedUf ] = useState('');
    const [ selectedCity, setSelectedCity ] = useState('');  
    
    const placeholderPickerUF = {
      label: 'Selecione um estado...',
      value: null,
      color: '#9EA0A4',
    };    

    const placeholderPickerCity = {
      label: 'Selecione uma cidade...',
      value: null,
      color: '#9EA0A4',
    };           

    const navigation = useNavigation();

    useEffect(() => {
      axios.get<IBGEUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
          const ufInitials = response.data.map<PickerItem>(uf => ({label: uf.sigla, value: uf.sigla }));

          setUfs(ufInitials);
      });
    }, []);

    useEffect(() => {
        if (selectedUf === '0') {
            return;
        }

        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
            const cities = response.data.map<PickerItem>(city => ({label: city.nome, value: city.nome}));

            setCities(cities);
        });

      }, [selectedUf] );    

    function handleNavigationToPoints() {
        navigation.navigate('Points', { city: selectedCity, uf: selectedUf });
    }

    function handleSelectUf(uf: string) {
      setSelectedUf(uf);
    }

    function handleSelectCity(city: string) {
      setSelectedCity(city);
    } 

    return (
        <ImageBackground source={require('../../assets/home-background.png')} 
            imageStyle={{ width: 274, height: 368 }}
            style={styles.container}>
            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')} />
                <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
                <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente</Text>
            </View>

            <View style={styles.footer}>
               
                <PickerSelect placeholder={placeholderPickerUF} style={pickerSelectStyles} value={selectedUf} onValueChange={(value) => handleSelectUf(value)}
                  items={ufs}
                />
                
                <PickerSelect placeholder={placeholderPickerCity} style={pickerSelectStyles} value={selectedCity} onValueChange={(value) => handleSelectCity(value)}
                  items={cities}
                />
      
                <RectButton style={styles.button} onPress={handleNavigationToPoints}>
                    <View style={styles.buttonIcon}>
                        <Text>
                            <Icon name="arrow-right" color="#FFF" size={24} />
                        </Text>
                    </View>
                    <Text style={styles.buttonText}>
                        Entrar
                    </Text>
                </RectButton>
            </View>         
        </ImageBackground>
    )
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32
    },
  
    main: {
      flex: 1,
      justifyContent: 'center',
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
      fontFamily: 'Ubuntu_700Bold',
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,
      fontFamily: 'Roboto_400Regular',
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    select: {},
  
    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    }
  });

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 5,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    backgroundColor: '#FFF',
    borderColor: 'black',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 5,
  },
});

export default Home;