import React, { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../../../utils/AxiosInstance";
import { useMemberships } from "../../../context/MembershipContext";



function AdminEntryBtn({ communityID }) {
    const [role, setRole] = useState("");
    const navigate = useNavigate();

    const { memberships } = useMemberships();
    const [membership, setMembership] = useState<any>({});

    useEffect(() => {
        if (memberships) {
            setMembership(memberships.find((membership) => membership.community === communityID));
        }
    }, [memberships, communityID])

    useEffect(() => {
        if (membership) {
            setRole(membership.role);
        }
    }, [membership])

    if (role !== 'admin' && role !== 'owner') {
        return null;
    }

    return (
        <button
            className="inline-flex items-center px-4 py-2 mx-3 border border-transparent rounded-md shadow-sm text-sm font-medium btn btn-primary"
            onClick={() => navigate(`/community/${communityID}/settings`)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
        </button>
    )
}

export default AdminEntryBtn;
