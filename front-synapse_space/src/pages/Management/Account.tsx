import React, { useEffect, useState } from 'react';
import { FileText, MessageSquare, ThumbsUp } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import AxiosInstance from "../../utils/AxiosInstance";
import ErrorAlert from "../../components/ErrorAlert";
import SuccessAlert from "../../components/SuccessAlert";
import { TimeRangeSelector } from "../../components/charts/TimeRangeSelector";
import { Metric, MetricSelector } from "../../components/charts/MetricSelector";
import { EngagementChart } from "../../components/charts/EngagementChart";
import type { TimeRange, Metric as MetricType, EngagementData } from '../../components/admin/types/activity';
import EditProfile from '../Profile/EditProfile';



function Account() {

    return (
        <div className="flex min-h-screen bg-base-200">
            <Sidebar />
            <div className="flex-1">
                <Header />
                <main>
                    <div className="flex flex-col">
                        <EditProfile/>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Account;
