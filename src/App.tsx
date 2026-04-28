import './App.scss';
import React, {useEffect} from 'react';
import {Outlet, Route, Routes, useNavigate} from "react-router";
import i18n from "./translation/i18n.tsx";
// Components
import OAuthRedirect from "@pages/oauth-redirect/OAuthRedirect.tsx";
import Sidebar from "./components/sidebar/Sidebar";
import Header from "./components/header/Header";
import Home from "./pages/home/Home";
import AboutMemoria from "./pages/about-memoria/AboutMemoria";
import AboutMe from "./pages/about-me/AboutMe";
import Faq from "./pages/faq/Faq";
import PrivacyPolicies from "./pages/privacy/PrivacyPolicies";
import MapAndLocation from "./pages/map/MapAndLocation";
import CollectionList from "./pages/collection/CollectionList.tsx";
import LocationList from "./pages/location/LocationList.tsx";
import ItemList from "./pages/item/ItemList.tsx";
import ProfilePage from "./pages/profile/ProfilePage.tsx";
import SessionExpireDialog from "./components/session-expire-dialog/SessionExpireDialog";
// Models
import {CookieKey} from "./constants/Storage";
import {PathName} from './constants/Page';
// Services
import {CookieUtil} from "./utils/CookieUtil";
import AppToolbar from "./components/app-toolbar/AppToolbar.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {useAppContext} from "./providers/AppProvider.tsx";
import SidebarProvider from "@providers/SidebarProvider.tsx";

const PATH_NOT_LOGIN = ['/', PathName.ABOUT_MEMORIA, PathName.ABOUT_ME, PathName.FAQ, PathName.PRIVACY];

export default function App() {
    const {currentLanguage} = useAppContext();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (CookieUtil.getCookie(CookieKey.ACCESS_TOKEN)) {
            queryClient.refetchQueries({ queryKey: ['getCurrentUser'] }).then(() => {
                if (window.location.pathname === '/') {
                    navigate(PathName.MAP);
                }
            });
        }
    }, [navigate, queryClient]);

    useEffect(() => {
        i18n.changeLanguage(currentLanguage);
    }, [currentLanguage]);

    return (
        <div className="App">
            {(window.location.pathname === '/' || PATH_NOT_LOGIN.includes(window.location.pathname.slice(1))) ? <Header/> : (
                <SidebarProvider>
                    <AppToolbar/>
                    <Sidebar/>
                </SidebarProvider>
            )}

            <div className="main-container">
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path={PathName.ABOUT_MEMORIA} element={<AboutMemoria/>}/>
                    <Route path={PathName.ABOUT_ME} element={<AboutMe/>}/>
                    <Route path={PathName.FAQ} element={<Faq/>}/>
                    <Route path={PathName.PRIVACY} element={<PrivacyPolicies/>}/>
                    <Route path={PathName.MAP} element={
                        <Protected>
                            <MapAndLocation/>
                        </Protected>
                    }/>
                    <Route path={PathName.COLLECTION} element={
                        <Protected>
                           <Outlet/>
                        </Protected>
                    }>
                        <Route index element={<CollectionList/>}/>
                        <Route path={`:collectionId/${PathName.LOCATION}`}>
                            <Route index element={<LocationList/>}/>
                            <Route path={`:locationId/${PathName.ITEM}`} element={<ItemList/>}/>
                        </Route>
                    </Route>
                    <Route path={PathName.PROFILE} element={
                        <Protected>
                            <ProfilePage/>
                        </Protected>
                    }/>
                    <Route path="/oauth2/redirect" element={<OAuthRedirect/>}/>
                </Routes>
            </div>
        </div>
    );
}

function Protected({children}: Readonly<{ children: React.JSX.Element }>) {

    return (
        CookieUtil.getCookie(CookieKey.ACCESS_TOKEN) ? children : <SessionExpireDialog/>
    )
}
