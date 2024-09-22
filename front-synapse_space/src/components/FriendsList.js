import React from 'react';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faUserGroup, faCompass, faBarsStaggered } from '@fortawesome/free-solid-svg-icons'

const FriendsList = () => {
  return (
    <aside id="logo-sidebar" class="fixed top-0 right-0 z-40 w-64 pt-20 transition-transform -translate-x-full  sm:translate-x-0  " style={{ height: 95 + '%' }} aria-label="Sidebar">
      <div class="h-full px-3 pb-4 overflow-y-auto bg-base-200 my-3 rounded-lg">
      <p class="text-sm font-semibold">Friends</p>
        <ul class="space-y-2 font-medium my">

        </ul>
      </div>
    </aside>

  );
};

export default FriendsList;