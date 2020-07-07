import React, { useEffect, useState, ChangeEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import api from '../../services/api';

import './styles.css'
import logo from '../../assets/logo.svg';
import Dropzone from '../../components/Dropzone'
import { stringify } from 'querystring';

// Sempre quando define um array ou objeto no estado: informar o tipo de variável manualmente

interface Item {
    id: number,
    title: string,
    image_url: string
}

interface IBGEUfResponse {
    sigla: string
}

interface IBGECityResponse {
    id: number,
    nome: string
}

const CreatePoint = () => {
    const [ items, setItems ] = useState<Item[]>([]);
    const [ ufs, setUfs ] = useState<string[]>([]);
    const [ cities, setCities ] = useState<string[]>([]);

    const [ initialPosition, setInitialPosition ] = useState<[number, number]>([0, 0]);

    const [ formData, setFormData ] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });

    const [ selectedUf, setSelectedUf ] = useState('0');
    const [ selectedCity, setSelectedCity ] = useState('0');
    const [ selectedPosition, setSelectedPosition ] = useState<[number, number]>([0, 0]);
    const [ selectedItems, setSelectedItems ] = useState<number[]>([]);
    const [ selectedFile, setSelectedFile ] = useState<File>();

    const history = useHistory();

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        axios.get<IBGEUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);

            setUfs(ufInitials);
        });
    }, []);

    useEffect(() => {
        if (selectedUf === '0') {
            return;
        }

        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
            const cities = response.data.map(city => city.nome);

            setCities(cities);
        });

    }, [selectedUf] );

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            
            setInitialPosition([latitude, longitude]);
        });
    }, []);

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedUf(event.target.value);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedCity(event.target.value);
    }

    function handleMouseClick(event: LeafletMouseEvent){
        setSelectedPosition([ event.latlng.lat, event.latlng.lng ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setFormData({ ...formData, [name]: value });
    }

    function handleSelectItem(id: number) {
        const alreadySelected = selectedItems.includes(id);

        if (alreadySelected) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit() {
        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [ latitude, longitude ] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));  
        
        if (selectedFile) {
            data.append('image', selectedFile);
        }

        // const data = {
        //     name,
        //     email,
        //     whatsapp,
        //     uf,
        //     city,
        //     latitude,
        //     longitude,
        //     items,
        // }

        await api.post('points', data);

        alert('Ponto de coleta criado!');

        history.push('/');
    }
 
    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="EColeta"/>
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <Dropzone onFileUpload={setSelectedFile} />
                
                <fieldset>
                    <legend><h2>Dados</h2></legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange} />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" name="email" id="email" onChange={handleInputChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whasapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMouseClick} >
                        <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                        
                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(
                                    uf => (<option key={uf} value={uf}>{uf}</option>)
                                )}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(
                                    city => (<option key={city} value={city}>{city}</option>)
                                )}
                            </select>
                        </div>                        
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                        
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>                              
            </form>

        </div>
    );
}

export default CreatePoint;