import React from 'react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import {BrowserRouter} from "react-router-dom";



const root = createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Auth0Provider
                domain="dev-ry60461345n1hsy0.eu.auth0.com"
                clientId="FdRy45AesrjzTtfxh6x7oF0VJqsets7w"
                authorizationParams={{
                    redirect_uri: window.location.origin
                }}
            >
            {/*    <Auth0ProviderWithNavigate>*/}
                    <App />
                {/*</Auth0ProviderWithNavigate>*/}
            </Auth0Provider>
        </BrowserRouter>
    </React.StrictMode>,
);


reportWebVitals();
