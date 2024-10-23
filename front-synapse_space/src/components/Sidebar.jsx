import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faUserGroup, faCompass, faBarsStaggered } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from "react-router-dom";
import LgCommunityPill from './community/LgCommunityPill';
import { useMemberships } from '../context/MembershipContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { memberships } = useMemberships();

  return (
    <aside id="logo-sidebar" className="fixed  top-0 left-0 z-40 w-64 pt-20 transition-transform -translate-x-full sm:translate-x-0 lg:block hidden" style={{ height: '95%' }} aria-label="Sidebar">
      <div className="h-full px-3 overflow-y-auto bg-base-200   pb-3 rounded-lg my-2">
        <ul className="space-y-2 bg-base-200 font-medium fixed  z-40">
          <li>
            <button onClick={() => navigate('/')} className="flex items-center w-full p-2 rounded-full group mt-3 bg-white dark:text-neutral hover:bg-gray-100 dark:hover:bg-gray-700">
              <FontAwesomeIcon icon={faHome} />
              <span className="ms-3">Home</span>
            </button>
          </li>

          <li>
            <button onClick={() => navigate('/community/create')} className="flex items-center w-full p-2 rounded-full group mt-3  bg-white dark:text-neutral hover:bg-gray-100 dark:hover:bg-gray-700">
              <FontAwesomeIcon icon={faUserGroup} />
              <span className="ms-3">Create new Community</span>
            </button>
          </li>

          <li>
            <button onClick={() => navigate('/community/discover')} className="flex items-center w-full p-2 rounded-full group mt-3  bg-white dark:text-neutral hover:bg-gray-100 dark:hover:bg-gray-700">
              <FontAwesomeIcon icon={faCompass} />
              <span className="ms-3">Discover Communities</span>
            </button>
          </li>

          <li>
            <div className="divider divider-start text-sm mt-5"><FontAwesomeIcon icon={faBarsStaggered}></FontAwesomeIcon>Communities</div>
          </li>
        </ul>
        <div className="px-3 py-8 rounded-lg mt-40">
          <ul className="font-medium">
            {memberships.map((membership) => (
              <li className='my-2' key={membership.community}>
                <LgCommunityPill communityID={membership.community} communityName={membership.community_name} commAvatar={membership.community_avatar} />
              </li>
            ))}

          </ul>

        </div>
      </div>
    </aside>
  );


};

export default Sidebar;