import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Checklist from "@editorjs/checklist";
import Quote from "@editorjs/quote";
import CodeTool from "@editorjs/code";
import ImageTool from "@editorjs/image";
import Embed from "@editorjs/embed";
import Table from "@editorjs/table";
import Warning from "@editorjs/warning";
import Delimiter from "@editorjs/delimiter";
import InlineCode from "@editorjs/inline-code";
import Marker from "@editorjs/marker";

const RichTextEditor = ({ onChange, setEditorContent }) => {
    const editorRef = useRef(null);

    useEffect(() => {
        if (!editorRef.current) {
            editorRef.current = new EditorJS({
                holder: "editorjs",
                placeholder: "Start typing your content here...",
                tools: {
                    header: {
                        class: Header,
                        inlineToolbar: true,
                        config: {
                            levels: [1, 2, 3, 4],
                            defaultLevel: 2
                        }
                    },
                    list: {
                        class: List,
                        inlineToolbar: true
                    },
                    checklist: {
                        class: Checklist,
                        inlineToolbar: true
                    },
                    quote: {
                        class: Quote,
                        inlineToolbar: true
                    },
                    code: CodeTool,
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                uploadByFile(file) {
                                    return new Promise(resolve => {
                                        const objectUrl = URL.createObjectURL(file);
                                        resolve({
                                            success: 1,
                                            file: {
                                                url: objectUrl
                                            }
                                        });
                                    });
                                }
                            }
                        }
                    },
                    embed: Embed,
                    table: {
                        class: Table,
                        inlineToolbar: true
                    },
                    warning: Warning,
                    delimiter: Delimiter,
                    inlineCode: {
                        class: InlineCode,
                        shortcut: "CMD+SHIFT+M"
                    },
                    marker: {
                        class: Marker,
                        shortcut: "CMD+SHIFT+H"
                    }
                },
                onChange: () => {
                    editorRef.current.save().then(outputData => {
                        if (onChange) {
                            onChange(outputData);
                        }
                        setEditorContent(outputData);
                    });
                }
            });
        }

        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
            }
        };
    }, [onChange, setEditorContent]);

    return (
        <div className="min-h-md">
            <div
                id="editorjs"
                className="border border-base-300 rounded-lg p-4 min-h-[400px] focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent w-full"
            />
        </div>
    );
};

RichTextEditor.propTypes = {
    onChange: PropTypes.func,
    setEditorContent: PropTypes.func.isRequired
};

export default RichTextEditor;