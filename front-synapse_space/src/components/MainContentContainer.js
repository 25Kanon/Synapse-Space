import React from "react";
import PropTypes from 'prop-types';


const  MainContentContainer = ({ children }) => {


    return (
        <>
            <div className="flex flex-1 overflow-y-auto ">
                <div className="lg:mx-64 w-full pt-20  top-0 px-4" style={{ height: 95 + '%' }}>
                    <div className="h-full px-3 pb-4 overflow-y-clip bg-base-200 my-3 rounded-lg py-2 mx-28">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
MainContentContainer.propTypes = {
    children: PropTypes.node
};
export default MainContentContainer;
