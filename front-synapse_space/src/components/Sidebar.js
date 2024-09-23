import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faUserGroup, faCompass, faBarsStaggered } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from "react-router-dom";
import LgCommunityPill from './community/LgCommunityPill';

const Sidebar = () => {
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URI}/api/auth/memberships/`, {
          params: {
            student_number: user.student_number
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          }
        });
        setMemberships(response.data);
      } catch (error) {
        console.error('Error fetching memberships:', error);
      }
    };

    fetchMemberships();
  }, []);

  return (
    <aside id="logo-sidebar" class="fixed top-0 left-0 z-40 w-64 pt-20 transition-transform -translate-x-full  sm:translate-x-0  " style={{ height: 95 + '%' }} aria-label="Sidebar">
      <div class="h-full px-3 pb-4 overflow-y-auto bg-base-200 my-3 rounded-lg">
        <ul class="space-y-2 font-medium my">
          <li>
            <button onClick={() => navigate('/')} class="flex items-center w-full p-2 rounded-full group mt-3 bg-white text-neutral hover:bg-gray-100 dark:hover:bg-gray-700">
              <FontAwesomeIcon icon={faHome} />
              <span class="ms-3">Home</span>
            </button>
          </li>

          <li>
            <button onClick={() => navigate('/community/create')} class="flex items-center w-full p-2 rounded-full group mt-3 bg-white text-neutral hover:bg-gray-100 dark:hover:bg-gray-700">
              <FontAwesomeIcon icon={faUserGroup} />
              <span class="ms-3">Create new Community</span>
            </button>
          </li>

          <li>
            <button onClick={() => navigate('/community/discover')} class="flex items-center w-full p-2 rounded-full group mt-3 bg-white text-neutral hover:bg-gray-100 dark:hover:bg-gray-700">
              <FontAwesomeIcon icon={faCompass} />
              <span class="ms-3">Discover Communities</span>
            </button>
          </li>


          <li>
            <div class="divider divider-start text-sm mt-5"><FontAwesomeIcon icon={faBarsStaggered}></FontAwesomeIcon>Communities</div>
          </li>
          {memberships.map((membership) => (
           
            <li key={membership.id}>
              <LgCommunityPill communityName= {membership.community_name}/>
            </li>
          ))}
        </ul>
      </div>
    </aside>

  );
};

export default Sidebar;