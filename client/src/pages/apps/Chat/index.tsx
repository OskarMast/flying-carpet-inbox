import React, { useEffect, useState,useRef } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { API_Key } from '../../../config/index';

// components
import PageTitle from '../../../components/PageTitle';

import ChatUsers from './ChatUsers';
import ChatArea from './ChatArea';
// dummy data
import { USERS, ChatUserType,ApiType } from './data';
import { useCallback } from 'react';


// ChatApp
const ChatApp = () => {
    const [selectedUser, setSelectedUser] = useState<ChatUserType>({});
    // const [admin,setadmin] = useState<ChatUserType>({});
    const [USER,setUSER] = useState<ChatUserType[]>([]);
    const [users, setUser] = useState<ChatUserType[]>([]);
    const [API, setAPI] = useState<ApiType[]>([]);
    const [currentAPI,setCurrentAPI] = useState<ApiType>({});

    const [flag,setflag] = useState<boolean>(false);
    
    const { user, userLoggedIn, loading, error } = useSelector((state: RootState) => ({
        user: state.Auth.user,
        loading: state.Auth.loading,
        error: state.Auth.error,
        userLoggedIn: state.Auth.userLoggedIn,
    }));

    const [viewflag ,setviewflag] = useState<boolean>(false);
    const [mobile, setmobile] = useState<boolean>(false);

    const scrollref =  useRef<any>(); 
    
    /**
     * On user change
     */
    const onUserChange = (user: ChatUserType) => {
        setSelectedUser(user);
    };

    useEffect(() => {
        getAPIS();
        if (window.screen.width < 750) {
            setmobile(true);
        }
    },[])

    useEffect(() => {
        getUsers();
    },[currentAPI])

    useEffect(() => {
        setSelectedUser(users[0])

    },[users])

    
    


    const getUsers = () => {
        if (API.length == 0) return;
        console.log(currentAPI);
        const instance = currentAPI.instance;
        const token = currentAPI.token;
        const fetchemailurl = `https://api.chat-api.com/instance${instance}/messages?limit=0&token=${token}`;
        fetch(fetchemailurl)
        .then((res)=> res.json())
        .then((json)=>{
            const total = [...json.messages];
            console.log(total);
            let userdata : ChatUserType[] = [];
            let tempdata = [];
            total.sort((a : any, b : any) => b.time - a.time);
            for (let i = 0; i < total.length; i++) {
                if (tempdata.indexOf(total[i]['chatId']) == -1) {
                    tempdata.push(total[i]['chatId']);
                    let lastMessage;
                    if (total[i]['type'] != "chat") {
                        lastMessage = "Attached file";  
                    }else{
                        lastMessage = total[i].body.slice(0,20);
                    }
                    const time = total[i].time;
                    const timedate = new Date(time*1000);
                    let hour = timedate.getHours();
                    let min = timedate.getMinutes();
                    let tmp = " AM";
                    if (hour > 12) {
                        hour -= 12;
                        tmp = " PM";
                    }
                    
                    let user : ChatUserType = {
                        id : total[i]['chatName'],
                        avatar : "",
                        name : total[i]['senderName'],
                        userStatus : "online",
                        lastMessage : lastMessage,
                        lastMessageOn : hour + ":"+ (min < 10 ? "0" + min : min) +tmp
                    };
                    if (total[i]['fromMe'] == 1) {
                        user.name = total[i]['chatId'];
                    }
                    userdata.push(user)
                }
            }

            setUSER(userdata);
            setUser(userdata);
        })
        .catch(err=>{

        })
    }

    const getAPIS = () => {
        const sendData = {email : user.email}
        fetch("http://admin.fbmnow.com/api/apis/getAPI",{method : "POST",headers : {"Content-Type" : "application/json"},body: JSON.stringify(sendData)})
            .then(res => res.json())
            .then((json) => {
                let total : ApiType[] = [];
                for (let i = 0; i < json.length; i++) {
                    let temp  = {id : json[i].id, token : json[i].token, instance : json[i].instance,phone : json[i].phone,name : json[i].name};
                    total.push(temp)
                }
                console.log(total);
                setAPI(total);
                setCurrentAPI(total[0]);
            })
    }

    const search = (text: string) => {
        setUser(text ? [...USER].filter((u) => u.name!.toLowerCase().indexOf(text.toLowerCase()) >= 0) : [...USER]);
    };

    return (
        <>
            <PageTitle
                breadCrumbItems={[
                    // { label: 'Apps', path: '/apps/chat' },
                    // { label: 'Chat', path: '/apps/chat', active: true },
                ]}
                title={'Chat'}
            />

            <Row style={{direction : "rtl"}}>
                
                <Col lg={5} xxl={3} style={{display : !(mobile && viewflag) ? "" : "none"}}>
                    <ChatUsers  user={users} onUserSelect={onUserChange} viewflag={viewflag}  setviewflag={setviewflag} onSearch = {search}  currentAPI={currentAPI} setCurrentAPI={setCurrentAPI} API = {API} />
                </Col>
                <Col lg={7} xxl={9}   style={{display : !mobile || viewflag ? "" : "none"}}>
                    <ChatArea selectedUser={selectedUser} setUser={setUser} user={users}  viewflag={viewflag} setviewflag={setviewflag}  scrollref={scrollref} currentAPI={currentAPI}/>
                </Col>
                
                
            </Row>
        </>
    );
};

export default ChatApp;
