import React from 'react';


const FriendsList = () => {
  return (
    <aside id="sidebar" className="fixed top-0 right-0 w-64 pt-20 transition-transform -translate-x-full sm:translate-x-0 lg:block hidden" style={{ height: '95%' }} aria-label="Sidebar">
      <div className="h-full px-3 pb-4 overflow-y-auto bg-base-200 my-3 rounded-lg">
        <p className="text-sm font-semibold">Friends</p>
        <ul className="space-y-2 font-medium my">
          {/* Add list items here */}
        </ul>
      </div>
    </aside>
  );
};

export default FriendsList;