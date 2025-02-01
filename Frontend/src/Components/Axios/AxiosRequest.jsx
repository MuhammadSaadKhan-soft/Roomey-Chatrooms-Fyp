import axios from 'axios'

export const AxiosRequest = axios.create({
    baseURL:'http://localhost:5000'
});