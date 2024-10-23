import React, { useState } from 'react';

const CommentForm = ({ onSubmit, initialValue = '' }) => {
    const [formData, setFormData] = useState({
        content: initialValue,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.content.trim()) {
            onSubmit(formData.content);
            setFormData({ content: '' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
      <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Write a comment..."
          className="w-full textarea textarea-bordered p-2 rounded-lg resize-none"
          rows={3}
      />
            <button
                type="submit"
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
                {initialValue ? 'Update' : 'Submit'}
            </button>
        </form>
    );
};

export default CommentForm;

