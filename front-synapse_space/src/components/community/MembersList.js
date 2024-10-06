import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';

const MembersList = ({id}) => {
  const [members, setMembers] = useState([]);
  useEffect(() => {

    const fetchMembers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URI}/api/community/${id}/members/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          }
        });
        setMembers(response.data);
        console.log("members:", response.data);
      } catch (error) {
        console.error('Error fetching memberships:', error);
      }
    };

    fetchMembers();
  }, [id]);

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('');
};
  return (
    <aside id="sidebar" className="fixed top-0 right-0 w-64 pt-20 transition-transform -translate-x-full sm:translate-x-0 lg:block hidden" style={{ height: '95%' }} aria-label="Sidebar">
      <div className="h-full px-3 pb-4 overflow-y-auto bg-base-200 my-3 rounded-lg">
        <p className="text-sm font-semibold">Members</p>
        <ul className="space-y-2 font-medium my">
          {members.map((member) => (
            <li key={member.id}>
              <button className="flex items-center w-full p-2 rounded-full group mt-3">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content w-5 p-3 rounded-full">
                    <h2 className="text-sm font-bold">{getInitials(member.username)}</h2>
                  </div>
                </div>
                <span className="ms-3 text-sm">{member.username}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default MembersList;