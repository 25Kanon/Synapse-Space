import React, { useState, useRef, useEffect } from "react"
import {faChevronDown} from "@fortawesome/free-solid-svg-icons/faChevronDown";
import {faChevronUp} from "@fortawesome/free-solid-svg-icons/faChevronUp";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const MAX_HEIGHT = 300 // Maximum height in pixels before clipping

const StyledOutput = ({ data }) => {
    const [expanded, setExpanded] = useState(false)
    const [shouldClip, setShouldClip] = useState(false)
    const contentRef = useRef(null)


    useEffect(() => {
        const checkHeight = () => {
            if (contentRef.current) {
                setShouldClip(contentRef.current.scrollHeight > MAX_HEIGHT)
            }
        }

        checkHeight()
        window.addEventListener("resize", checkHeight)
        return () => window.removeEventListener("resize", checkHeight)
    }, [data])

    const renderBlock = block => {
        switch (block.type) {
            case "header":
                const HeaderTag = `h${block.data.level}`
                return (
                    <HeaderTag className="font-bold my-2">{block.data.text}</HeaderTag>
                )
            case "paragraph":
                return (
                    <p
                        className="my-2"
                        dangerouslySetInnerHTML={{ __html: block.data.text }}
                    />
                )
            case "list":
                const ListTag = block.data.style === "ordered" ? "ol" : "ul"
                return (
                    <ListTag
                        className={
                            block.data.style === "ordered" ? "list-decimal" : "list-disc"
                        }
                    >
                        {block.data.items.map((item, index) => (
                            <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                    </ListTag>
                )
            case "image":
                return (
                    <div className="flex flex-col">
                        <figure className="mb-2">
                            <img
                                src={block.data.file.url}
                                alt={block.data.caption}
                                className="col-1 h-auto max-w-full rounded-lg"
                            />
                        </figure>
                        <div>
                            {block.data.caption && (
                                <figcaption className="text-center text-sm mt-2">
                                    {block.data.caption}
                                </figcaption>
                            )}
                        </div>
                    </div>
                )
            case "quote":
                return (
                    <blockquote className="border-l-4 border-primary pl-4 italic my-4">
                        <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                        {block.data.caption && (
                            <cite className="block text-right mt-2">
                                — {block.data.caption}
                            </cite>
                        )}
                    </blockquote>
                )
            case "code":
                return (
                    <pre className="bg-base-300 p-4 rounded-lg overflow-x-auto my-4">
            <code>{block.data.code}</code>
          </pre>
                )
            case "delimiter":
                return <hr className="my-4 border-t border-base-300" />
            case "warning":
                return (
                    <div className="bg-warning text-warning-content p-4 rounded-lg my-4">
                        <strong>{block.data.title}</strong>
                        <p>{block.data.message}</p>
                    </div>
                )
            case "table":
                return (
                    <div className="overflow-x-auto my-4">
                        <table className="table table-zebra w-full">
                            <tbody>
                            {block.data.content.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            dangerouslySetInnerHTML={{ __html: cell }}
                                        />
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )
            default:
                return <p className="my-2">{JSON.stringify(block.data)}</p>
        }
    }

    return (
        <div className="styled-output">
            <div
                ref={contentRef}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expanded ? "max-h-full" : "max-h-[300px]"
                }`}
            >
                {data.blocks.map((block, index) => (
                    <div key={index}>{renderBlock(block)}</div>
                ))}
            </div>
            {shouldClip && (
                <div className="mt-4">
                    <button
                        className="btn btn-sm btn-outline"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? (
                            <span>
                                See less <FontAwesomeIcon icon={faChevronUp} className="text-current" />
                            </span>
                        ) : (
                            <span>
                                 See more <FontAwesomeIcon icon={faChevronDown} className="text-current" />
                            </span>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}

export default StyledOutput
