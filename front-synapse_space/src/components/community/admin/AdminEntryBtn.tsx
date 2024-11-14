import React, {useEffect, useState} from "react";
import {Settings} from "lucide-react";
import {useNavigate} from "react-router-dom";
import AxiosInstance from "../../../utils/AxiosInstance";

function AdminEntryBtn({communityID}) {
    const [role, setRole] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMembership = async () =>  {
            try{
                const response = await AxiosInstance.get(`api/community/${communityID}/membership/role/`,{},{withCredentials: true});
                setRole(response.data.role);
                console.log(response.data.role);
            }catch (error){
                console.log(error);
            }
        }
        fetchMembership();
    }, [communityID]);

    if ( role !== 'admin' && role !== 'owner') {
        console.log({role});
        return null;
    }

    return (
        <button
            className="inline-flex items-center px-4 py-2 mx-3 border border-transparent rounded-md shadow-sm text-sm font-medium btn btn-primary"
            onClick={() => navigate(`/community/${communityID}/settings`)}>
            <Settings className="w-4 h-4 mr-2"/>
            Settings
        </button>
    )
}

export default AdminEntryBtn;
