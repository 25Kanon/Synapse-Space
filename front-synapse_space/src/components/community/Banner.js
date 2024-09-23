import React, { useContext, useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from "axios";

const Banner = ({ communityName }) => {
    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(word => word[0]).join('');
    };

    return (
        <>
            <div class="px-3 pb-4  bg-base-200 my-3 rounded-lg">
                <div class="rounded-t-lg h-32 overflow-hidden">
                    <img class="object-cover object-top w-full" src='https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' alt='Mountain' />
                </div>

                <div class="ml-3 w-32 h-32 relative -mt-16 border-4 border-white rounded-full overflow-hidden">
                    <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content h-32 rounded-full">
                            <h2 className="text-lg font-bold ">{getInitials(communityName)}</h2>
                        </div>
                    </div>
                    {/* <img class="object-cover object-center h-32" src='https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' alt='Woman looking front' /> */}
                </div>

                <div class="text-left">
                    <h2 class="font-semibold -mt-8 ml-36">{communityName}</h2>
                </div>
            </div>
        </>
    );
}
export default Banner;
