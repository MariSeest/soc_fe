import React from 'react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import {BrowserRouter} from "react-router-dom";
import { Auth0ProviderWithNavigate } from "./auth0-provider-with-navigate";


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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
