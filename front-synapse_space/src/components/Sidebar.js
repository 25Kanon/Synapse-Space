import React from 'react';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faUserGroup, faCompass, faBarsStaggered } from '@fortawesome/free-solid-svg-icons'

const Sidebar = () => {
  return (
    <aside id="logo-sidebar" class="fixed top-0 left-0 z-40 w-64 pt-20 transition-transform -translate-x-full  sm:translate-x-0  " style={{ height: 95 + '%' }} aria-label="Sidebar">
      <div class="h-full px-3 pb-4 overflow-y-auto bg-base-200 my-3 rounded-lg">
        <ul class="space-y-2 font-medium my">
          <li>
            <a href="#" class="flex items-center p-2 rounded-full group mt-3 bg-white text-neutral hover:bg-gray-100 dark:hover:bg-gray-700">
              <FontAwesomeIcon icon={faHome} />
              <span class="ms-3">Home</span>
            </a>
          </li>

          <li>
            <a href="#" class="flex items-center p-2 rounded-full group mt-3 bg-white text-neutral hover:bg-gray-100 dark:hover:bg-gray-700">
              <FontAwesomeIcon icon={faUserGroup} />
              <span class="ms-3">Create new Community</span>
            </a>
          </li>

          <li>
            <a href="#" class="flex items-center p-2 rounded-full group mt-3 bg-white text-neutral hover:bg-gray-100 dark:hover:bg-gray-700">
              <FontAwesomeIcon icon={faCompass} />
              <span class="ms-3">Discover Communities</span>
            </a>
          </li>


          <li>
            <div class="divider divider-start text-sm mt-5"><FontAwesomeIcon icon={faBarsStaggered}></FontAwesomeIcon>Communities</div>
          </li>
        </ul>
      </div>
    </aside>

  );
};

export default Sidebar;