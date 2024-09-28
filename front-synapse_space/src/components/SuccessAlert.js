import React, { useState } from 'react';
import PropTypes from 'prop-types';

const SuccessAlert = ({ text, classExtensions }) => {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div role="alert" className={`alert alert-success ${classExtensions}`} id="alert-success">        
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{text}</span>
            <button
                type="button"
                className="ml-4"
                onClick={() => setVisible(false)}
            >
                Dismiss
            </button>
        </div>
    );
};

SuccessAlert.propTypes = {
    text: PropTypes.string.isRequired,
    classExtensions: PropTypes.string,
};

export default SuccessAlert;